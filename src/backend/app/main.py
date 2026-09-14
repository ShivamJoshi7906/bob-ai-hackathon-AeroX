"""
MissionGuard AI - FastAPI Application Entrypoint
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.bob import router as bob_router

app = FastAPI(
    title="MissionGuard AI — API",
    description="Mission Readiness & Predictive Maintenance Copilot Backend for BOB AI Hackathon 2026 (Challenge D1)",
    version="1.0.0"
)

# Enable CORS for React Frontend (Vite default: http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(bob_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "MissionGuard AI Backend",
        "version": "1.0.0",
        "ibm_bob_copilot": "operational"
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to MissionGuard AI Backend API",
        "docs_url": "/docs",
        "health_check": "/health"
    }
