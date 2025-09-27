from datetime import datetime, timezone
from typing import List
from sqlmodel import Session, select

from ..models.loan import Loan
from ..models.item import Item
from ..models.shoot import Shoot
from ..services.availability import reserved_quantity_for_item, to_utc_aware


def list_loans(session: Session) -> List[Loan]:
    """
    Return all loans.

    :param Session session: Active database session.
    :return List[Loan]: List of loans.
    """
    return session.exec(select(Loan)).all()


def create_loan(session: Session, item_id: int, shoot_id: int, quantity: int) -> Loan:
    """
    Create a new loan with availability validation.

    :param Session session: Active database session.
    :param int item_id: Item identifier.
    :param int shoot_id: Shoot identifier.
    :param int quantity: Quantity to loan (>=1).
    :return Loan: The created loan.
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
    loan = Loan(
        item_id=item.id,
        shoot_id=shoot.id,
        quantity=quantity,
        start_date=shoot.start_date,
        end_date=shoot.end_date,
    )
    session.add(loan)
    session.commit()
    session.refresh(loan)
    return loan


def update_loan_quantity(session: Session, loan_id: int, quantity: int) -> Loan:
    """
    Update an existing loan quantity if the loan has not started and availability allows it.

    :param Session session: Active database session.
    :param int loan_id: Loan identifier.
    :param int quantity: New quantity (>=1).
    :return Loan: The updated loan.
    """
    loan = session.get(Loan, loan_id)
    if not loan:
        raise KeyError("loan not found")
    now = datetime.now(timezone.utc)
    if to_utc_aware(loan.start_date) <= now:
        raise ValueError("loan already started")
    if quantity < 1:
        raise ValueError("quantity must be >= 1")
    item = session.get(Item, loan.item_id)
    if not item:
        raise KeyError("item not found")
    reserved = (
        reserved_quantity_for_item(session, item.id, loan.start_date, loan.end_date)
        - loan.quantity
    )
    available = item.total_stock - reserved
    if quantity > available:
        raise ValueError("no availability")
    loan.quantity = quantity
    session.add(loan)
    session.commit()
    session.refresh(loan)
    return loan


def cancel_loan(session: Session, loan_id: int) -> None:
    """
    Cancel a future loan (delete) if it has not started yet.

    :param Session session: Active database session.
    :param int loan_id: Loan identifier.
    """
    loan = session.get(Loan, loan_id)
    if not loan:
        return None
    now = datetime.now(timezone.utc)
    if to_utc_aware(loan.start_date) <= now:
        raise ValueError("loan already started")
    session.delete(loan)
    session.commit()
    return None
