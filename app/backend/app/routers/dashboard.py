from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Query

from ..db.core import get_session
from ..schemas.dashboard import ItemAvailability, ItemTimeline, TypeTimeline
from ..services.availability import (
    compute_inventory_rows,
    compute_timeline,
    compute_type_timeline,
)

router = APIRouter()


@router.get("/inventory", response_model=list[ItemAvailability])
def inventory_dashboard() -> list[ItemAvailability]:
    """
    Compute availability now per item based on active loans (not yet returned and overlapping now).

    :return list[ItemAvailability]: Dashboard rows
    """
    now = datetime.now(timezone.utc)
    with get_session() as session:
        return compute_inventory_rows(session, now)


@router.get("/timeline", response_model=list[ItemTimeline])
def timeline(days: int = Query(90, ge=1, le=365)) -> list[ItemTimeline]:
    """
    Compute per-item daily availability with breakdown for next `days`.

    :param int days: Number of days to compute
    :return list[ItemTimeline]: Per-item timeline
    """
    with get_session() as session:
        return compute_timeline(session, days=days)


@router.get("/timeline-by-type", response_model=list[TypeTimeline])
def timeline_by_type(days: int = Query(90, ge=1, le=365)) -> list[TypeTimeline]:
    """
    Compute per-item type daily availability with breakdown for next `days`.

    :param int days: Number of days to compute
    :return list[TypeTimeline]: Per-item type timeline
    """
    with get_session() as session:
        return compute_type_timeline(session, days=days)
