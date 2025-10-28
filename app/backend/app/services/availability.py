from datetime import datetime, timezone

from sqlmodel import Session, select

from ..models.booking import Booking


def to_utc_aware(dt: datetime) -> datetime:
    """
    Return a UTC-aware datetime, assuming naive values are already UTC.

    :param datetime dt: The datetime to convert.
    :return datetime: UTC-aware datetime.
    """
    if dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def periods_overlap(
    a_start: datetime,
    a_end: datetime,
    b_start: datetime,
    b_end: datetime,
) -> bool:
    """
    Determine whether two half-open intervals [a_start, a_end) and [b_start, b_end) overlap.

    :param datetime a_start: Start of period A
    :param datetime a_end: End of period A
    :param datetime b_start: Start of period B
    :param datetime b_end: End of period B
    :return bool: True if intervals overlap
    """
    a_start_u, a_end_u = to_utc_aware(a_start), to_utc_aware(a_end)
    b_start_u, b_end_u = to_utc_aware(b_start), to_utc_aware(b_end)
    return not (a_end_u <= b_start_u or a_start_u >= b_end_u)


def reserved_quantity_for_item(
    session: Session,
    item_id: int,
    start: datetime,
    end: datetime,
) -> int:
    """
    Compute the total quantity reserved for an item overlapping the given period.

    :param Session session: Active DB session
    :param int item_id: Target item identifier
    :param datetime start: Start of requested period
    :param datetime end: End of requested period
    :return int: Reserved quantity
    """
    bookings: list[Booking] = session.exec(
        select(Booking).where(Booking.item_id == item_id, Booking.returned_at.is_(None))
    ).all()
    return sum(
        booking.quantity
        for booking in bookings
        if periods_overlap(booking.start_date, booking.end_date, start, end)
    )


def reserved_quantity_for_item_excluding(
    session: Session,
    item_id: int,
    start: datetime,
    end: datetime,
    exclude_booking_id: int,
) -> int:
    """
    Compute reserved quantity for an item over a period, excluding one booking.

    :param Session session: Active DB session
    :param int item_id: Item id
    :param datetime start: Period start
    :param datetime end: Period end
    :param int exclude_booking_id: Booking id to exclude from the count
    :return int: Reserved quantity excluding given booking
    """
    bookings: list[Booking] = session.exec(
        select(Booking).where(
            Booking.item_id == item_id,
            Booking.returned_at.is_(None),
            Booking.id != exclude_booking_id,
        )
    ).all()
    return sum(
        booking.quantity
        for booking in bookings
        if periods_overlap(booking.start_date, booking.end_date, start, end)
    )
