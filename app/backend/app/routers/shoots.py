from fastapi import APIRouter, HTTPException
from sqlmodel import select

from ..db.core import get_session
from ..models.shoot import Shoot
from ..schemas.shoots import ShootCreate

router = APIRouter()


@router.post("/", response_model=Shoot)
def create_shoot(payload: ShootCreate) -> Shoot:
    """
    Create a new shoot (tournage).

    :param ShootCreate payload: Shoot information
    :return Shoot: Created shoot
    """
    if payload.end_date <= payload.start_date:
        raise HTTPException(status_code=400, detail="end_date must be after start_date")

    with get_session() as session:
        shoot = Shoot(
            name=payload.name,
            location=payload.location,
            start_date=payload.start_date,
            end_date=payload.end_date,
        )
        session.add(shoot)
        session.commit()
        session.refresh(shoot)
        print("✅ Created shoot", shoot.id)
        return shoot


@router.get("/", response_model=list[Shoot])
def list_shoots() -> list[Shoot]:
    """
    List all shoots.

    :return list[Shoot]: Shoots
    """
    with get_session() as session:
        return session.exec(select(Shoot)).all()
