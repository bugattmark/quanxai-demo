"""QuanXAI FastAPI Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from quanxai.config import settings
from quanxai.database import create_db_and_tables
from quanxai.routers import (
    organizations_router,
    teams_router,
    users_router,
    analytics_router,
    keys_router,
    logs_router,
    products_router,
    usage_router,
    guardrails_router,
    budgets_router,
    tags_router,
    audit_router,
    cache_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup: create database tables
    create_db_and_tables()
    print("Database tables created successfully")
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="QuanXAI",
    description="AI Landing Zone - Unified LLM Gateway & Analytics",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(organizations_router, prefix="/api/organizations", tags=["Organizations"])
app.include_router(teams_router, prefix="/api/teams", tags=["Teams"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(keys_router, prefix="/api/keys", tags=["Virtual Keys"])
app.include_router(logs_router, prefix="/api/logs", tags=["Request Logs"])
app.include_router(products_router, prefix="/api/products", tags=["AWS Products"])
app.include_router(usage_router, prefix="/api/usage", tags=["Usage Analytics"])
app.include_router(guardrails_router, prefix="/api/guardrails", tags=["Guardrails"])
app.include_router(budgets_router, prefix="/api/budgets", tags=["Budgets"])
app.include_router(tags_router, prefix="/api/tags", tags=["Tags"])
app.include_router(audit_router, prefix="/api/audit", tags=["Audit Logs"])
app.include_router(cache_router, prefix="/api/cache", tags=["Cache"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": "0.1.0",
        "description": "AI Landing Zone Platform",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "quanxai"}
