from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException as FastAPIHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .db.core import create_db_and_tables, auto_return_task
from .routers import items, shoots, bookings, dashboard


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


app = FastAPI(title="Polypore Stock API", version="0.1.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(
    request: Request,
    exc: FastAPIHTTPException,
) -> JSONResponse:
    """
    Global handler to ensure error responses are top-level objects matching our schemas.
    Accepts either plain-string detail or structured dict with `detail` and `code`.
    """
    payload: dict
    if isinstance(exc.detail, dict):
        payload = exc.detail
    else:
        payload = {"detail": str(exc.detail), "code": "INTERNAL_ERROR"}
    return JSONResponse(status_code=exc.status_code, content=payload)


# Routers
app.include_router(items.router, prefix="/items")
app.include_router(shoots.router, prefix="/shoots")
app.include_router(bookings.router, prefix="/bookings")
app.include_router(dashboard.router, prefix="/dashboard")
