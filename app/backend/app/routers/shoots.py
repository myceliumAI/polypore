from fastapi import APIRouter, HTTPException, Response
from sqlmodel import select

from ..db.core import get_session
from ..models.shoot import Shoot
from ..models.loan import Loan
from ..models.item import Item
from ..schemas.shoots import ShootCreate, ShootUpdate

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


@router.patch("/{shoot_id}", response_model=Shoot)
def update_shoot(shoot_id: int, payload: ShootUpdate) -> Shoot:
    """
    Update a shoot.

    :param int shoot_id: Shoot ID
    :param ShootUpdate payload: Shoot information
    :return Shoot: Updated shoot
    """
    with get_session() as session:
        shoot = session.get(Shoot, shoot_id)
        if not shoot:
            raise HTTPException(status_code=404, detail="shoot not found")
        if payload.name is not None:
            shoot.name = payload.name
        if payload.location is not None:
            shoot.location = payload.location
        if payload.start_date is not None:
            shoot.start_date = payload.start_date
        if payload.end_date is not None:
            shoot.end_date = payload.end_date
        if shoot.end_date <= shoot.start_date:
            raise HTTPException(
                status_code=400, detail="end_date must be after start_date"
            )
        session.add(shoot)
        session.commit()
        session.refresh(shoot)
        print("✅ Updated shoot", shoot.id)
        return shoot


@router.delete("/{shoot_id}", status_code=204)
def delete_shoot(shoot_id: int) -> None:
    """
    Delete a shoot.

    :param int shoot_id: Shoot ID
    :return None:
    """
    with get_session() as session:
        shoot = session.get(Shoot, shoot_id)
        if not shoot:
            return None
        # Remove related loans first to keep availability consistent and avoid FK issues
        loans = session.exec(select(Loan).where(Loan.shoot_id == shoot_id)).all()
        for ln in loans:
            session.delete(ln)
        session.delete(shoot)
        session.commit()
        print("✅ Deleted shoot and", len(loans), "related loan(s)")
        return None


@router.get("/{shoot_id}/packing-list.csv")
def packing_list_csv(shoot_id: int) -> Response:
    """Export a CSV of items and quantities to take for the shoot.

    :param int shoot_id: Shoot ID
    :return Response: Response
    """
    with get_session() as session:
        shoot = session.get(Shoot, shoot_id)
        if not shoot:
            raise HTTPException(status_code=404, detail="shoot not found")
        loans = session.exec(select(Loan).where(Loan.shoot_id == shoot_id)).all()
        # Aggregate by item_id
        qty_by_item: dict[int, int] = {}
        for ln in loans:
            qty_by_item[ln.item_id] = qty_by_item.get(ln.item_id, 0) + ln.quantity
        if not qty_by_item:
            content = "item_id,item_name,item_type,quantity\n"
        else:
            items = session.exec(
                select(Item).where(Item.id.in_(list(qty_by_item.keys())))
            ).all()
            id_to_item = {it.id: it for it in items}
            rows = ["item_id,item_name,item_type,quantity"]
            for item_id, qty in qty_by_item.items():
                it = id_to_item.get(item_id)
                name = it.name if it else str(item_id)
                typ = (
                    (it.type.value if hasattr(it.type, "value") else str(it.type))
                    if it
                    else "unknown"
                )
                rows.append(f"{item_id},{name},{typ},{qty}")
            content = "\n".join(rows) + "\n"
        filename = f"shoot_{shoot_id}_packing_list.csv"
        headers = {"Content-Disposition": f"attachment; filename={filename}"}
        return Response(content=content, media_type="text/csv", headers=headers)
