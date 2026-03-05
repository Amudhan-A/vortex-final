from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from api.webhook import webhook_router

app = FastAPI(title="GitBlame Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(webhook_router)


@app.get("/")
def root():
    return {"message": "Backend running"}