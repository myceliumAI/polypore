from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Query, status

from ..db.core import get_session
from ..schemas.dashboard import ItemAvailability, ItemTimeline, TypeTimeline
from ..schemas.errors import ApiError, ErrorCode
from ..services.availability import (
    compute_inventory_rows,
    compute_timeline,
    compute_type_timeline,
)

router = APIRouter(tags=["Dashboard"])


@router.get(
    "/inventory",
    response_model=list[ItemAvailability],
    status_code=status.HTTP_200_OK,
    summary="Inventory snapshot",
    description="Return current availability per item (now).",
    response_description="List of items with availability now",
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": [ItemAvailability.example() or {}],
                },
            },
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INTERNAL_ERROR)
                }
            },
        },
    },
)
def inventory_dashboard() -> list[ItemAvailability]:
    """
    Current per-item availability snapshot.

    :return list[ItemAvailability]: Snapshot rows
    """
    now = datetime.now(timezone.utc)
    with get_session() as session:
        return compute_inventory_rows(session, now)


@router.get(
    "/timeline",
    response_model=list[ItemTimeline],
    status_code=status.HTTP_200_OK,
    summary="Item timelines",
    description="Per-item daily availability with breakdown for the next N days.",
    response_description="Per-item series",
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": [ItemTimeline.example() or {}],
                },
            },
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INTERNAL_ERROR)
                }
            },
        },
    },
)
def timeline(days: int = Query(90, ge=1, le=365)) -> list[ItemTimeline]:
    """
    Per-item daily availability for the next `days`.

    :param int days: Horizon in days
    :return list[ItemTimeline]: Per-item series
    """
    with get_session() as session:
        return compute_timeline(session, days=days)


@router.get(
    "/timeline-by-type",
    response_model=list[TypeTimeline],
    status_code=status.HTTP_200_OK,
    summary="Type timelines",
    description="Per-type daily availability aggregated across items for the next N days.",
    response_description="Per-type series",
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": [TypeTimeline.example() or {}],
                },
            },
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INTERNAL_ERROR)
                }
            },
        },
    },
)
def timeline_by_type(days: int = Query(90, ge=1, le=365)) -> list[TypeTimeline]:
    """
    Per-type daily availability for the next `days`.

    :param int days: Horizon in days
    :return list[TypeTimeline]: Per-type series
    """
    with get_session() as session:
        return compute_type_timeline(session, days=days)
