import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.seed_data import seed_initial_data
from app.services.scheduler import start_scheduler
from app.routers import auth, exams, subscriptions, deadlines, notifications, ai_assistant, demo

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("examalert")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ExamAlert AI",
    description="AI-Powered Competitive Exam Notification Assistant: Official source monitoring, change detection, zero-hallucination extraction, and Telegram/Email alerts.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(exams.router, prefix=settings.API_V1_STR)
app.include_router(subscriptions.router, prefix=settings.API_V1_STR)
app.include_router(deadlines.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(ai_assistant.router, prefix=settings.API_V1_STR)
app.include_router(demo.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    logger.info("Initializing database with official competitive exam catalogue...")
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

    logger.info("Starting background deadline & monitoring scheduler...")
    start_scheduler()
    logger.info("ExamAlert AI Backend is operational!")

@app.get("/")
def root():
    return {
        "name": "ExamAlert AI API",
        "status": "online",
        "tagline": "Never Miss an Exam Deadline",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": "connected"
    }

# ---------------- PRODUCTION SPA SERVING ----------------
import os
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Resolve frontend dist path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
frontend_dist = os.path.join(project_root, "frontend", "dist")

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        target = os.path.join(frontend_dist, full_path)
        if os.path.exists(target) and os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
