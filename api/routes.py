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
    get_repo_files
)


router = APIRouter()


@router.post("/analyze")
def analyze_function(repo_path: str, filepath: str, function_name: str):

    # Step 1 — Mine Git history
    git_context = mine_git_history(
        repo_path,
        filepath,
        function_name
    )

    # Step 2 — Run analyzer
    analysis, ownership = analyze(git_context)

    # Step 3 — Store in MongoDB
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

    existing = get_function(
        req.repo_name,
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

    update_function(
        req.repo_name,
        req.filepath,
        req.function_name,
        {
            "decision_log": {
                "why_it_exists": result.why_it_exists,
                "key_decisions": result.key_decisions,
                "linked_issues": result.linked_issues,
                "generated_at": result.generated_at
            }
        }
    )

    stored = get_function(
        req.repo_name,
        req.filepath,
        req.function_name
    )

    return {
        "analysis": stored.get("analysis"),
        "ownership": stored.get("ownership"),
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


# include webhook routes
router.include_router(webhook_router)