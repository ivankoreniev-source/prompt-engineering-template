import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, results, tests

app = FastAPI(title="Test Platform (QuizCraft) Backend", version="1.0.0")

# Configure allowed CORS origins:
# Supports explicit comma-separated origins from CORS_ORIGINS environment variable
# Defaults to localhost development ports.
env_cors = os.getenv("CORS_ORIGINS")
if env_cors:
    origins = [orig.strip() for orig in env_cors.split(",") if orig.strip()]
else:
    origins = [
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(tests.router, prefix="/api")
app.include_router(results.router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "app": "QuizCraft"}


@app.get("/api/health")
def api_health() -> dict[str, str]:
    return {"status": "ok", "app": "QuizCraft"}
