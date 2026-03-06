from fastapi import APIRouter, Request
from analyzer.repo_graph import build_repo_graph
from db.repository import save_repo_graph

webhook_router = APIRouter()

@webhook_router.post("/github-webhook")
async def github_webhook(repo_name: str, repo_path: str):

    repo_graph = build_repo_graph(repo_path)

    save_repo_graph(repo_name, repo_graph)

    return {"status": "graph updated"}