from datetime import datetime, timezone, timedelta, date

from sqlmodel import Session, select

from ..models.item import Item
from ..models.booking import Booking
from ..models.shoot import Shoot
from ..schemas.dashboard import (
    ItemAvailability,
    ItemTimeline,
    DayAvailability,
    DayBreakdown,
    TypeTimeline,
)


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


def compute_stock_rows(session: Session, when: datetime) -> list[ItemAvailability]:
    """
    Build dashboard rows of availability at a moment in time.

    :param Session session: Active DB session
    :param datetime when: Timestamp to evaluate availability
    :return list[ItemAvailability]: Per-item availability snapshot
    """
    when_u = to_utc_aware(when)
    items: list[Item] = session.exec(select(Item)).all()
    bookings: list[Booking] = session.exec(
        select(Booking).where(Booking.returned_at.is_(None))
    ).all()

    rows: list[ItemAvailability] = []
    for item in items:
        active_reserved = sum(
            booking.quantity
            for booking in bookings
            if booking.item_id == item.id
            and (
                to_utc_aware(booking.start_date)
                <= when_u
                <= to_utc_aware(booking.end_date)
            )
        )
        available = max(item.total_stock - active_reserved, 0)
        rows.append(
            ItemAvailability(
                item_id=item.id,
                name=item.name,
                type=item.type,
                total_stock=item.total_stock,
                available_now=available,
            )
        )
    return rows


def compute_timeline(session: Session, days: int = 90) -> list[ItemTimeline]:
    """Compute per-item daily availability with breakdown for next `days`.

    :param Session session: Active DB session
    :param int days: Number of days to compute
    :return list[ItemTimeline]: Per-item timeline
    """
    today = datetime.now(timezone.utc).date()
    items: list[Item] = session.exec(select(Item)).all()
    bookings: list[Booking] = session.exec(select(Booking)).all()
    shoots: dict[int, Shoot] = {s.id: s for s in session.exec(select(Shoot)).all()}

    timelines: list[ItemTimeline] = []
    for item in items:
        series: list[DayAvailability] = []
        for i in range(days):
            d: date = today + timedelta(days=i)
            day_start = datetime(d.year, d.month, d.day, tzinfo=timezone.utc)
            day_end = day_start + timedelta(days=1)

            day_bookings = [
                bk
                for bk in bookings
                if bk.item_id == item.id
                and periods_overlap(bk.start_date, bk.end_date, day_start, day_end)
            ]
            total_reserved = sum(bk.quantity for bk in day_bookings)
            available = max(item.total_stock - total_reserved, 0)
            breakdown = [
                DayBreakdown(
                    shoot_id=bk.shoot_id,
                    shoot_name=(
                        shoots.get(bk.shoot_id).name
                        if shoots.get(bk.shoot_id)
                        else str(bk.shoot_id)
                    ),
                    quantity=bk.quantity,
                )
                for bk in day_bookings
            ]
            series.append(
                DayAvailability(
                    date=d.isoformat(),
                    available=available,
                    total=item.total_stock,
                    breakdown=breakdown,
                )
            )
        timelines.append(
            ItemTimeline(item_id=item.id, name=item.name, type=item.type, series=series)
        )
    return timelines


def compute_type_timeline(session: Session, days: int = 90) -> list[TypeTimeline]:
    """Aggregate per-type daily availability from item timelines.

    :param Session session: Active DB session
    :param int days: Number of days to compute
    :return list[TypeTimeline]: Per-item type timeline
    """
    item_series = compute_timeline(session, days=days)
    # Build a dict: type -> list[DayAvailability] aggregated by day index
    agg: dict[str, list[DayAvailability]] = {}
    for item in item_series:
        key = item.type.value if hasattr(item.type, "value") else str(item.type)
        if key not in agg:
            agg[key] = [
                DayAvailability(date=day.date, available=0, total=0, breakdown=[])
                for day in item.series
            ]
        for idx, day in enumerate(item.series):
            agg[key][idx].available += day.available
            agg[key][idx].total += day.total
            # no need to merge breakdowns across items in type view (could explode), keep empty
    return [
        TypeTimeline(
            type=item_series[0].type.__class__(k)
            if hasattr(item_series[0].type, "__class__")
            else k,
            series=v,
        )
        for k, v in agg.items()
    ]
