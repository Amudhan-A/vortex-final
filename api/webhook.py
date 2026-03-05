from fastapi import APIRouter

webhook_router = APIRouter(prefix="/webhook")

@webhook_router.post("/github")
async def github_webhook():
    return {"status": "received"}