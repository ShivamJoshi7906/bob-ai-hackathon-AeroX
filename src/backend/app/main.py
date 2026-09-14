"""
MissionGuard AI - Unified FastAPI Application Entrypoint
Integrates Member 2 REST API Services & Member 4 IBM Bob Copilot
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.backend.app.config import settings
from src.backend.app.database import engine, Base, SessionLocal
from src.backend.app.services.asset_service import seed_database_if_empty

from src.backend.app.routes import (
    assets,
    sensors,
    predictions,
    readiness,
    maintenance,
    missions,
)
from src.backend.app.routes.bob import router as bob_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lifespan Startup Logic
    print("[FastAPI Lifespan] Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()

    print("[FastAPI Lifespan] Startup complete! MissionGuard AI Backend active.")
    yield
    print("[FastAPI Lifespan] Shutting down backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Mission Readiness & Predictive Maintenance Copilot Backend for BOB AI Hackathon 2026 (Challenge D1)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Member 2 API Routers under /api
app.include_router(assets.router, prefix=settings.API_V1_STR, tags=["Assets & Fleet"])
app.include_router(sensors.router, prefix=settings.API_V1_STR, tags=["Sensors Telemetry"])
app.include_router(predictions.router, prefix=settings.API_V1_STR, tags=["ML Predictions & Failure Risk"])
app.include_router(readiness.router, prefix=settings.API_V1_STR, tags=["Mission Readiness"])
app.include_router(maintenance.router, prefix=settings.API_V1_STR, tags=["Maintenance Queue"])
app.include_router(missions.router, prefix=settings.API_V1_STR, tags=["Mission Windows"])

# Register Member 4 IBM Bob Copilot Router (/api/bob)
app.include_router(bob_router)


@app.get("/", tags=["Root"])
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs_url": "/docs",
        "api_v1_prefix": settings.API_V1_STR,
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "MissionGuard AI Backend",
        "version": "1.0.0",
        "ibm_bob_copilot": "operational",
    }

