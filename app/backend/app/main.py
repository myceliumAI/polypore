from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db.core import create_db_and_tables, auto_return_task
from .routers import items, shoots, loans, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Init DB and background task on startup; clean up on shutdown."""
    create_db_and_tables()
    auto_return_task.start()
    print(f"✅ Backend started at {datetime.utcnow().isoformat()}Z")
    try:
        yield
    finally:
        auto_return_task.stop()
        print("💡 Shutdown background tasks")


app = FastAPI(title="Polypore Inventory API", version="0.1.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(items.router, prefix="/items", tags=["items"])
app.include_router(shoots.router, prefix="/shoots", tags=["shoots"])
app.include_router(loans.router, prefix="/loans", tags=["loans"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
