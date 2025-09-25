from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from ..db.core import get_session
from ..models.loan import Loan

router = APIRouter()


@router.post("/{loan_id}", response_model=Loan)
def return_loan(loan_id: int) -> Loan:
    """
    Manually mark a loan as returned now.

    :param int loan_id: Loan identifier
    :return Loan: Updated loan
    """
    with get_session() as session:
        loan = session.get(Loan, loan_id)
        if not loan:
            raise HTTPException(status_code=404, detail="loan not found")
        if loan.returned_at is not None:
            return loan
        loan.returned_at = datetime.now(timezone.utc)
        session.add(loan)
        session.commit()
        session.refresh(loan)
        print("✅ Returned loan", loan.id)
        return loan
