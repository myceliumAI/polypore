from datetime import datetime, timezone
from typing import List
from sqlmodel import Session, select

from ..models.booking import Booking
from ..models.item import Item
from ..models.shoot import Shoot
from ..services.availability import reserved_quantity_for_item, to_utc_aware


def list_bookings(session: Session) -> List[Booking]:
    """
    Return all bookings.

    :param Session session: Active database session.
    :return List[Booking]: List of bookings.
    """
    return session.exec(select(Booking)).all()


def create_booking(
    session: Session, item_id: int, shoot_id: int, quantity: int
) -> Booking:
    """
    Create a new booking with availability validation.

    :param Session session: Active database session.
    :param int item_id: Item identifier.
    :param int shoot_id: Shoot identifier.
    :param int quantity: Quantity to book (>=1).
    :return Booking: The created booking.
    """
    item = session.get(Item, item_id)
    shoot = session.get(Shoot, shoot_id)
    if not item or not shoot:
        raise KeyError("item or shoot not found")
    if quantity < 1:
        raise ValueError("quantity must be >= 1")
    reserved = reserved_quantity_for_item(
        session, item.id, shoot.start_date, shoot.end_date
    )
    available = item.total_stock - reserved
    if quantity > available:
        raise ValueError("no availability")
    booking = Booking(
        item_id=item.id,
        shoot_id=shoot.id,
        quantity=quantity,
        start_date=shoot.start_date,
        end_date=shoot.end_date,
    )
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


def update_booking_quantity(
    session: Session, booking_id: int, quantity: int
) -> Booking:
    """
    Update an existing booking quantity if the booking has not started and availability allows it.

    :param Session session: Active database session.
    :param int booking_id: Booking identifier.
    :param int quantity: New quantity (>=1).
    :return Booking: The updated booking.
    """
    booking = session.get(Booking, booking_id)
    if not booking:
        raise KeyError("booking not found")
    now = datetime.now(timezone.utc)
    if to_utc_aware(booking.start_date) <= now:
        raise ValueError("booking already started")
    if quantity < 1:
        raise ValueError("quantity must be >= 1")
    item = session.get(Item, booking.item_id)
    if not item:
        raise KeyError("item not found")
    reserved = (
        reserved_quantity_for_item(
            session, item.id, booking.start_date, booking.end_date
        )
        - booking.quantity
    )
    available = item.total_stock - reserved
    if quantity > available:
        raise ValueError("no availability")
    booking.quantity = quantity
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


def cancel_booking(session: Session, booking_id: int) -> None:
    """
    Cancel a future booking (delete) if it has not started yet.

    :param Session session: Active database session.
    :param int booking_id: Booking identifier.
    """
    booking = session.get(Booking, booking_id)
    if not booking:
        return None
    now = datetime.now(timezone.utc)
    if to_utc_aware(booking.start_date) <= now:
        raise ValueError("booking already started")
    session.delete(booking)
    session.commit()
    return None
