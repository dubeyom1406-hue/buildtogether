from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import (
    users_router, ideas_router, requests_router,
    posts_router, notifications_router, messages_router, events_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()  # Create tables on startup
    yield


app = FastAPI(
    title="Together API",
    description="Backend API for the Together collaborative campus platform.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────
app.include_router(users_router)
app.include_router(ideas_router)
app.include_router(requests_router)
app.include_router(posts_router)
app.include_router(notifications_router)
app.include_router(messages_router)
app.include_router(events_router)


@app.get("/")
async def root():
    return {"message": "Together API is running!", "docs": "/docs"}
