from fastapi import APIRouter
from analyzer import analyze
from api.schemas import ExplainRequest
from service.explain_function import explain_function
# Dev1 miner import (adjust if function name differs)
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
        "repo": git_context.repo,
        "filepath": git_context.filepath,
        "function_name": git_context.function_name,

        "analysis": {
            "callers": analysis.callers,
            "callees": analysis.callees,
            "blast_radius": analysis.blast_radius
        },

        "ownership": {
            "primary_owner": ownership.primary_owner,
            "confidence": ownership.confidence
        }
    }

    update_function(
        git_context.repo,
        git_context.filepath,
        git_context.function_name,
        data
    )

    return {
        "analysis": analysis,
        "ownership": ownership
    }

@router.post("/explain-function")
def explain(req: ExplainRequest):

    # use repo_path consistently, not repo_name
    existing = get_function(
        req.repo_path,     # ← fix: was req.repo_name
        req.filepath,
        req.function_name
    )

    if existing and "decision_log" in existing:
        return {
            "analysis": existing.get("analysis"),
            "ownership": existing.get("ownership"),
            "decision_log": existing.get("decision_log")
        }

    result = explain_function(
        repo_path=req.repo_path,
        filepath=req.filepath,
        function_name=req.function_name,
        owner=req.owner,
        repo_name=req.repo_name
    )

    # re-run analyze to get analysis + blast_radius and save everything together
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
        req.repo_path,     # ← fix: was req.repo_name
        req.filepath,
        req.function_name,
        {
            "repo":          req.repo_path,
            "filepath":      req.filepath,
            "function_name": req.function_name,
            "analysis": {
                "callers":      analysis.callers,
                "callees":      analysis.callees,
                "blast_radius": analysis.blast_radius   # ← now actually saved
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
            }
        }
    )

    stored = get_function(
        req.repo_path,     # ← fix: was req.repo_name
        req.filepath,
        req.function_name
    )

    return {
        "analysis":    stored.get("analysis"),
        "ownership":   stored.get("ownership"),
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


# THIS GIVES ALL THE FUNCTIOSN 

# @router.get("/repo-map")
# def get_repo_map(repo: str):

#     edges = list(call_graph_collection.find({"repo": repo}, {"_id": 0}))

#     nodes = set()

#     for edge in edges:
#         nodes.add(edge["caller"])
#         nodes.add(edge["callee"])

#     return {
#         "nodes": list(nodes),
#         "edges": edges
#     }

@router.get("/repo-map")
def get_repo_map(repo: str):

    edges = list(call_graph_collection.find({"repo": repo}, {"_id": 0}))

    functions = set(f["function_name"] for f in get_repo_functions(repo))

    filtered_edges = [
        e for e in edges
        if (
            e["caller"] in functions
            or e["callee"] in functions
            or e["callee"][0].isupper()   # likely a class
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
            stats[owner] = {
                "name": owner,
                "commits": 0,
                "functions": 0
            }

        stats[owner]["functions"] += 1

    contributors = list(stats.values())

    return {"contributors": contributors}

# include webhook routes
router.include_router(webhook_router)