from fastapi import APIRouter
from analyzer import analyze
from api.schemas import ExplainRequest
from service.explain_function import explain_function
# Dev1 miner import (adjust if function name differs)
from miner.git_processor import mine_git_history

router = APIRouter()


@router.post("/analyze")
def analyze_function(repo_path: str, filepath: str, function_name: str):

    # Step 1 — Mine Git history (Dev1)
    git_context = mine_git_history(
        repo_path,
        filepath,
        function_name
    )

    # Step 2 — Run analyzer (Dev2)
    analysis, ownership = analyze(git_context)

    return {
        "analysis": analysis,
        "ownership": ownership
    }

    

@router.post("/explain-function")
def explain(req: ExplainRequest):

    result = explain_function(
        repo_path=req.repo_path,
        filepath=req.filepath,
        function_name=req.function_name,
        owner=req.owner,
        repo_name=req.repo_name
    )

    return result