from datetime import datetime, timezone

from fastapi import APIRouter

from ..db.core import get_session
from ..schemas.dashboard import ItemAvailability
from ..services.availability import compute_inventory_rows

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
