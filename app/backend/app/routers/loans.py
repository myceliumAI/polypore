from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Response
from sqlmodel import select

from ..db.core import get_session
from ..models.item import Item
from ..models.shoot import Shoot
from ..models.loan import Loan
from ..schemas.loans import LoanCreate, LoanUpdate
from ..services.availability import reserved_quantity_for_item, to_utc_aware

router = APIRouter()


@router.post("/", response_model=Loan)
def create_loan(payload: LoanCreate) -> Loan:
    """Create a new loan for a given item and shoot, enforcing availability.

    :param LoanCreate payload: Loan request
    :return Loan: Created loan
    """
    with get_session() as session:
        item = session.get(Item, payload.item_id)
        shoot = session.get(Shoot, payload.shoot_id)
        if not item or not shoot:
            raise HTTPException(status_code=404, detail="item or shoot not found")
        if payload.quantity < 1:
            raise HTTPException(status_code=400, detail="quantity must be >= 1")

        reserved = reserved_quantity_for_item(
            session, item.id, shoot.start_date, shoot.end_date
        )
        available = item.total_stock - reserved
        if payload.quantity > available:
            raise HTTPException(
                status_code=400, detail="❌ Plus de matériel disponible pour ces dates"
            )

        loan = Loan(
            item_id=item.id,
            shoot_id=shoot.id,
            quantity=payload.quantity,
            start_date=shoot.start_date,
            end_date=shoot.end_date,
        )
        session.add(loan)
        session.commit()
        session.refresh(loan)
        print("✅ Created loan", loan.id)
        return loan


@router.get("/", response_model=list[Loan])
def list_loans() -> list[Loan]:
    with get_session() as session:
        return session.exec(select(Loan)).all()


@router.patch("/{loan_id}", response_model=Loan)
def update_loan(loan_id: int, payload: LoanUpdate) -> Loan:
    """Update a loan (quantity only in this POC).

    :param int loan_id: Loan ID
    :param LoanUpdate payload: Loan information
    :return Loan: Updated loan
    """
    with get_session() as session:
        loan = session.get(Loan, loan_id)
        if not loan:
            raise HTTPException(status_code=404, detail="loan not found")
        now = datetime.now(timezone.utc)
        if to_utc_aware(loan.start_date) <= now:
            raise HTTPException(
                status_code=400, detail="loan already started; cannot modify"
            )
        if payload.quantity is not None:
            if payload.quantity < 1:
                raise HTTPException(status_code=400, detail="quantity must be >= 1")
            # Re-check availability with new qty
            item = session.get(Item, loan.item_id)
            if not item:
                raise HTTPException(status_code=404, detail="item not found")
            reserved = reserved_quantity_for_item(
                session, item.id, loan.start_date, loan.end_date
            )
            # remove current loan's quantity from reserved to avoid double counting
            reserved -= loan.quantity
            available = item.total_stock - reserved
            if payload.quantity > available:
                raise HTTPException(
                    status_code=400,
                    detail="❌ Plus de matériel disponible pour ces dates",
                )
            loan.quantity = payload.quantity
        session.add(loan)
        session.commit()
        session.refresh(loan)
        print("✅ Updated loan", loan.id)
        return loan


@router.post("/{loan_id}/cancel", status_code=204)
def cancel_loan(loan_id: int) -> Response:
    """Cancel a future loan; not allowed if loan has started.

    :param int loan_id: Loan ID
    :return Response: Response
    """
    now = datetime.now(timezone.utc)
    with get_session() as session:
        loan = session.get(Loan, loan_id)
        if not loan:
            raise HTTPException(status_code=404, detail="loan not found")
        start = to_utc_aware(loan.start_date)
        if start <= now:
            raise HTTPException(
                status_code=400, detail="loan already started; cannot cancel"
            )
        session.delete(loan)
        session.commit()
        print("✅ Canceled loan", loan_id)
        return Response(status_code=204)
