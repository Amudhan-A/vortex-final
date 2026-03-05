from fastapi import APIRouter

webhook_router = APIRouter()


@webhook_router.post("/webhook/github")
def github_webhook(payload: dict):

    # placeholder for future processing
    return {
        "status": "received",
        "event": "github_webhook"
    }