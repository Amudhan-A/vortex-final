from fastapi import APIRouter
from analyzer import analyze

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