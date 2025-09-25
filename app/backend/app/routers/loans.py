from fastapi import APIRouter, HTTPException
from sqlmodel import select

from ..db.core import get_session
from ..models.item import Item
from ..models.shoot import Shoot
from ..models.loan import Loan
from ..schemas.loans import LoanCreate
from ..services.availability import reserved_quantity_for_item

router = APIRouter()


@router.post("/", response_model=Loan)
def create_loan(payload: LoanCreate) -> Loan:
    """
    Create a new loan for a given item and shoot, enforcing availability.

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
                status_code=400,
                detail="❌ Plus de matériel disponible pour ces dates",
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
    """
    List all loans.

    :return list[Loan]: Loans
    """
    with get_session() as session:
        return session.exec(select(Loan)).all()
