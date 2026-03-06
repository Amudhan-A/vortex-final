from fastapi import APIRouter
from analyzer import analyze
from api.schemas import ExplainRequest
from service.explain_function import explain_function
from miner.git_processor import mine_git_history
from .webhook import webhook_router
from db.repository import (
    update_function,
    get_function,
    get_repo_functions,
    get_repo_files,
    save_repo_graph,
    call_graph_collection
)
from analyzer.repo_graph import build_repo_graph
import ollama

router = APIRouter()


@router.post("/analyze")
def analyze_function(
    repo_path: str,
    filepath: str,
    function_name: str,
    owner: str,
    repo_name: str
):
    git_context = mine_git_history(
        repo_path,
        filepath,
        function_name,
        owner,
        repo_name
    )

    analysis, ownership = analyze(git_context)

    repo_graph = build_repo_graph(repo_path)
    save_repo_graph(repo_path, repo_graph)

    data = {
        "repo":          git_context.repo,
        "filepath":      git_context.filepath,
        "function_name": git_context.function_name,
        "analysis": {
            "callers":      analysis.callers,
            "callees":      analysis.callees,
            "blast_radius": analysis.blast_radius
        },
        "ownership": {
            "primary_owner": ownership.primary_owner,
            "confidence":    ownership.confidence
        },
        "commits": [
            {
                "sha":           c.sha,
                "message":       c.message.strip(),
                "author":        c.author,
                "date":          c.date,
                "diff_snippet":  c.diff_snippet[:300] if c.diff_snippet else "",
                "linked_issues": c.linked_issues
            }
            for c in git_context.commits[:10]
        ],
        "prs": [
            {
                "pr_number": pr.pr_number,
                "title":     pr.title,
                "body":      (pr.body or "")[:300]
            }
            for pr in git_context.prs[:5]
        ]
    }

    update_function(
        git_context.repo,
        git_context.filepath,
        git_context.function_name,
        data
    )

    # return unchanged — frontend only needs these two
    return {
        "analysis": analysis,
        "ownership": ownership
    }


@router.post("/explain-function")
def explain(req: ExplainRequest):

    existing = get_function(
        req.repo_path,
        req.filepath,
        req.function_name
    )

    if existing and "decision_log" in existing:
        return {
            "analysis":     existing.get("analysis"),
            "ownership":    existing.get("ownership"),
            "decision_log": existing.get("decision_log")
        }

    result = explain_function(
        repo_path=req.repo_path,
        filepath=req.filepath,
        function_name=req.function_name,
        owner=req.owner,
        repo_name=req.repo_name
    )

    from miner.git_processor import mine_git_history
    from analyzer.analyze import analyze

    git_context = mine_git_history(
        req.repo_path,
        req.filepath,
        req.function_name,
        req.owner,
        req.repo_name
    )
    analysis, ownership = analyze(git_context)

    update_function(
        req.repo_path,
        req.filepath,
        req.function_name,
        {
            "repo":          req.repo_path,
            "filepath":      req.filepath,
            "function_name": req.function_name,
            "analysis": {
                "callers":      analysis.callers,
                "callees":      analysis.callees,
                "blast_radius": analysis.blast_radius
            },
            "ownership": {
                "primary_owner": ownership.primary_owner,
                "confidence":    ownership.confidence
            },
            "decision_log": {
                "why_it_exists": result.why_it_exists,
                "key_decisions": result.key_decisions,
                "linked_issues": result.linked_issues,
                "generated_at":  result.generated_at
            },
            "commits": [                              # ← added
                {
                    "sha":           c.sha,
                    "message":       c.message.strip(),
                    "author":        c.author,
                    "date":          c.date,
                    "diff_snippet":  c.diff_snippet[:300] if c.diff_snippet else "",
                    "linked_issues": c.linked_issues
                }
                for c in git_context.commits[:10]
            ],
            "prs": [                                  # ← added
                {
                    "pr_number": pr.pr_number,
                    "title":     pr.title,
                    "body":      (pr.body or "")[:300]
                }
                for pr in git_context.prs[:5]
            ]
        }
    )

    stored = get_function(
        req.repo_path,
        req.filepath,
        req.function_name
    )

    # return unchanged — frontend only needs these three
    return {
        "analysis":     stored.get("analysis"),
        "ownership":    stored.get("ownership"),
        "decision_log": stored.get("decision_log")
    }


@router.get("/functions")
def list_functions(repo_name: str):
    functions = get_repo_functions(repo_name)
    return {"functions": functions}


@router.get("/function")
def get_function_data(repo: str, filepath: str, function_name: str):
    data = get_function(repo, filepath, function_name)
    return data


@router.get("/files")
def list_files(repo_name: str):
    files = get_repo_files(repo_name)
    return {"files": files}


@router.get("/repo-map")
def get_repo_map(repo: str):
    edges = list(call_graph_collection.find({"repo": repo}, {"_id": 0}))
    functions = set(f["function_name"] for f in get_repo_functions(repo))

    filtered_edges = [
        e for e in edges
        if (
            e["caller"] in functions
            or e["callee"] in functions
            or e["callee"][0].isupper()
        )
    ]

    nodes = set()
    for edge in filtered_edges:
        nodes.add(edge["caller"])
        nodes.add(edge["callee"])

    return {
        "nodes": list(nodes),
        "edges": filtered_edges
    }


@router.get("/contributors")
def get_contributors(repo: str):
    functions = get_repo_functions(repo)
    stats = {}

    for f in functions:
        owner = f.get("ownership", {}).get("primary_owner")
        if not owner:
            continue
        if owner not in stats:
            stats[owner] = {"name": owner, "commits": 0, "functions": 0}
        stats[owner]["functions"] += 1

    return {"contributors": list(stats.values())}


@router.get("/commit-frequency")
def get_commit_frequency(repo: str):
    from collections import defaultdict
    import datetime

    functions = get_repo_functions(repo)
    weekly = defaultdict(int)

    for fn in functions:
        for commit in fn.get("commits", []):
            try:
                date = datetime.datetime.fromisoformat(commit["date"])
                week = date.strftime("%b %d")
                weekly[week] += 1
            except:
                continue

    sorted_weeks = sorted(weekly.items())[-8:]
    return {
        "commitFrequency": [
            {"date": k, "commits": v}
            for k, v in sorted_weeks
        ]
    }


@router.get("/search")
def search_functions(repo: str, query: str):
    functions = get_repo_functions(repo)
    query_lower = query.lower()
    results = [
        f for f in functions
        if query_lower in f.get("function_name", "").lower()
        or query_lower in f.get("filepath", "").lower()
        or query_lower in (f.get("ownership") or {}).get("primary_owner", "").lower()
    ]
    return {"results": results}


@router.post("/ask")
def ask_codebase(repo: str, question: str):
    from db.mongodb import functions_collection

    query_lower = question.lower()
    all_functions = list(functions_collection.find(
        {"repo": repo},
        {"_id": 0}
    ))

    # 1. Score and rank by relevance
    scored = []
    for fn in all_functions:
        score = 0
        fn_name  = fn.get("function_name", "").lower()
        filepath = fn.get("filepath", "").lower()
        why      = (fn.get("decision_log") or {}).get("why_it_exists", "").lower()
        owner    = (fn.get("ownership") or {}).get("primary_owner", "").lower()
        blast    = " ".join((fn.get("analysis") or {}).get("blast_radius", []) or []).lower()
        commits  = " ".join([
            (c.get("message") or "") + " " + (c.get("author") or "")
            for c in (fn.get("commits") or [])
        ]).lower()

        for word in query_lower.split():
            if word in fn_name:   score += 3
            if word in filepath:  score += 2
            if word in why:       score += 2
            if word in owner:     score += 2  # bumped — owner queries are common
            if word in blast:     score += 1
            if word in commits:   score += 1  # commit messages now searchable too

        if score > 0:
            scored.append((score, fn))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_functions = [fn for _, fn in scored[:5]]

    # 2. Fallback
    if not top_functions:
        top_functions = all_functions[:5]

    # 3. Build context
    context_parts = []
    for fn in top_functions:
        analysis     = fn.get("analysis") or {}
        ownership    = fn.get("ownership") or {}
        decision_log = fn.get("decision_log") or {}
        commits      = fn.get("commits") or []
        prs          = fn.get("prs") or []

        commit_text = "\n".join([
            f"  [{c.get('date', '')[:10]}] {c.get('author', '')}: {c.get('message', '').strip()}"
            + (f"\n    issues: {c.get('linked_issues')}" if c.get("linked_issues") else "")
            + (f"\n    diff: {c.get('diff_snippet', '')[:200]}"  if c.get("diff_snippet")  else "")
            for c in commits[:5]
        ]) or "none"

        pr_text = "\n".join([
            f"  PR #{p.get('pr_number')}: {p.get('title', '')}\n    {p.get('body', '')[:200]}"
            for p in prs[:3]
        ]) or "none"

        context_parts.append(f"""
FUNCTION: {fn.get("function_name")}
FILE: {fn.get("filepath")}
OWNER: {ownership.get("primary_owner", "unknown")} ({float(ownership.get("confidence", 0)):.0%} confidence)
CALLERS: {", ".join(analysis.get("callers", []) or []) or "none"}
CALLEES: {", ".join(analysis.get("callees", []) or []) or "none"}
BLAST RADIUS: {", ".join(analysis.get("blast_radius", []) or []) or "none"}
PURPOSE: {decision_log.get("why_it_exists", "unknown")}
KEY DECISIONS: {"; ".join(decision_log.get("key_decisions", []) or []) or "none"}
RECENT COMMITS:
{commit_text}
PULL REQUESTS:
{pr_text}
""")

    context = "\n---\n".join(context_parts)

    # 4. Ask the LLM
    prompt = f"""You are a codebase assistant. Answer the question using ONLY the provided context.
Be elaborate and factual. If the answer isn't in the context, say so.

CONTEXT:
{context}

QUESTION: {question}

ANSWER:"""

    try:
        response = ollama.chat(
            model="llama3.2",
            messages=[{"role": "user", "content": prompt}]
        )
        answer = response["message"]["content"]
    except Exception as e:
        answer = f"Could not generate answer: {str(e)}"

    return {
        "answer": answer,
        "sources": [
            {
                "function_name": fn.get("function_name"),
                "filepath":      fn.get("filepath"),
                "ownership":     fn.get("ownership", {})
            }
            for fn in top_functions
        ]
    }


# include webhook routes
router.include_router(webhook_router)