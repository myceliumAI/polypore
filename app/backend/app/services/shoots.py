from typing import List, Dict
from datetime import datetime
from sqlmodel import Session, select

from ..models.shoot import Shoot
from ..models.booking import Booking
from ..models.item import Item


def list_shoots(session: Session) -> List[Shoot]:
    """
    Return all shoots.

    :param Session session: Active database session.
    :return List[Shoot]: List of shoots.
    """
    return session.exec(select(Shoot)).all()


def create_shoot(
    session: Session,
    name: str,
    location: str,
    start_date: datetime,
    end_date: datetime,
) -> Shoot:
    """
    Create a new shoot with basic date validation.

    :param Session session: Active database session.
    :param str name: Shoot name.
    :param str location: Shoot location.
    :param datetime start_date: Start datetime (UTC recommended).
    :param datetime end_date: End datetime (must be after start).
    :return Shoot: The created shoot.
    """
    if end_date <= start_date:
        raise ValueError("end_date must be after start_date")
    shoot = Shoot(
        name=name, location=location, start_date=start_date, end_date=end_date
    )
    session.add(shoot)
    session.commit()
    session.refresh(shoot)
    return shoot


def update_shoot(
    session: Session,
    shoot_id: int,
    name: str | None,
    location: str | None,
    start_date: datetime | None,
    end_date: datetime | None,
) -> Shoot:
    """
    Partially update a shoot and validate date order if dates changed.

    :param Session session: Active database session.
    :param int shoot_id: Target shoot identifier.
    :param str|None name: New name if provided.
    :param str|None location: New location if provided.
    :param datetime|None start_date: New start datetime if provided.
    :param datetime|None end_date: New end datetime if provided.
    :return Shoot: The updated shoot.
    """
    shoot = session.get(Shoot, shoot_id)
    if not shoot:
        raise KeyError("shoot not found")
    if name is not None:
        shoot.name = name
    if location is not None:
        shoot.location = location
    if start_date is not None:
        shoot.start_date = start_date
    if end_date is not None:
        shoot.end_date = end_date
    if shoot.end_date <= shoot.start_date:
        raise ValueError("end_date must be after start_date")
    session.add(shoot)
    session.commit()
    session.refresh(shoot)
    return shoot


def delete_shoot(session: Session, shoot_id: int) -> int:
    """
    Delete a shoot and cascade-delete all related bookings.

    :param Session session: Active database session.
    :param int shoot_id: Target shoot identifier.
    :return int: Number of deleted bookings.
    """
    shoot = session.get(Shoot, shoot_id)
    if not shoot:
        return 0
    bookings = session.exec(select(Booking).where(Booking.shoot_id == shoot_id)).all()
    for bk in bookings:
        session.delete(bk)
    session.delete(shoot)
    session.commit()
    return len(bookings)


def build_packing_list_csv(session: Session, shoot_id: int) -> str:
    """
    Build a CSV packing list for a shoot by aggregating item quantities across bookings.

    :param Session session: Active database session.
    :param int shoot_id: Target shoot identifier.
    :return str: CSV content with headers.
    """
    shoot = session.get(Shoot, shoot_id)
    if not shoot:
        raise KeyError("shoot not found")
    bookings = session.exec(select(Booking).where(Booking.shoot_id == shoot_id)).all()
    qty_by_item: Dict[int, int] = {}
    for bk in bookings:
        qty_by_item[bk.item_id] = qty_by_item.get(bk.item_id, 0) + bk.quantity
    if not qty_by_item:
        return "item_id,item_name,item_type,quantity\n"
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
    return "\n".join(rows) + "\n"
