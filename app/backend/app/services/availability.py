from datetime import datetime, timezone

from sqlmodel import Session, select

from ..models.item import Item
from ..models.loan import Loan
from ..schemas.dashboard import ItemAvailability


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
    loans: list[Loan] = session.exec(
        select(Loan).where(Loan.item_id == item_id, Loan.returned_at.is_(None))
    ).all()
    return sum(
        loan.quantity
        for loan in loans
        if periods_overlap(loan.start_date, loan.end_date, start, end)
    )


def compute_inventory_rows(session: Session, when: datetime) -> list[ItemAvailability]:
    """
    Build dashboard rows of availability at a moment in time.

    :param Session session: Active DB session
    :param datetime when: Timestamp to evaluate availability
    :return list[ItemAvailability]: Per-item availability snapshot
    """
    when_u = to_utc_aware(when)
    items: list[Item] = session.exec(select(Item)).all()
    loans: list[Loan] = session.exec(
        select(Loan).where(Loan.returned_at.is_(None))
    ).all()

    rows: list[ItemAvailability] = []
    for item in items:
        active_reserved = sum(
            loan.quantity
            for loan in loans
            if loan.item_id == item.id
            and (to_utc_aware(loan.start_date) <= when_u <= to_utc_aware(loan.end_date))
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
