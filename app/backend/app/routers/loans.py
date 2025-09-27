from __future__ import annotations


from fastapi import APIRouter, HTTPException, Response, status

from ..db.core import get_session
from ..services import loans as svc
from ..schemas.loans import LoanCreate, LoanUpdate
from ..models.loan import Loan

router = APIRouter(tags=["Loans"])


@router.post(
    "/",
    response_model=Loan,
    status_code=status.HTTP_201_CREATED,
    summary="Create loan",
    description="Create a loan for an item on a given shoot with availability checks.",
    response_description="Loan created",
    responses={
        201: {
            "content": {
                "application/json": {
                    "example": {"id": 1, "item_id": 1, "shoot_id": 42, "quantity": 1}
                }
            }
        },
        400: {
            "description": "No availability or invalid payload",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "❌ Plus de matériel disponible pour ces dates"
                    }
                }
            },
        },
        404: {
            "description": "Item or shoot not found",
            "content": {
                "application/json": {"example": {"detail": "item or shoot not found"}}
            },
        },
    },
)
def create_loan(payload: LoanCreate) -> Loan:
    """
    Create a new loan.

    :param LoanCreate payload: Loan payload
    :return Loan: Created loan
    """
    with get_session() as session:
        try:
            loan = svc.create_loan(
                session, payload.item_id, payload.shoot_id, payload.quantity
            )
        except KeyError:
            raise HTTPException(status_code=404, detail="item or shoot not found")
        except ValueError as e:
            detail = str(e)
            if detail == "no availability":
                raise HTTPException(
                    status_code=400,
                    detail="❌ Plus de matériel disponible pour ces dates",
                )
            raise HTTPException(status_code=400, detail=detail)
        print("✅ Created loan", loan.id)
        return loan


@router.get(
    "/",
    response_model=list[Loan],
    status_code=status.HTTP_200_OK,
    summary="List loans",
    description="List all loans.",
    response_description="List of loans",
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": [{"id": 1, "item_id": 1, "shoot_id": 42, "quantity": 1}]
                }
            }
        }
    },
)
def list_loans() -> list[Loan]:
    with get_session() as session:
        return svc.list_loans(session)


@router.patch(
    "/{loan_id}",
    response_model=Loan,
    status_code=status.HTTP_200_OK,
    summary="Update loan quantity",
    description="Update quantity of a future loan after re-checking availability.",
    response_description="Updated loan",
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": {"id": 1, "item_id": 1, "shoot_id": 42, "quantity": 2}
                }
            }
        },
        400: {
            "description": "Invalid payload or loan started",
            "content": {
                "application/json": {"example": {"detail": "loan already started"}}
            },
        },
        404: {
            "description": "Loan or item not found",
            "content": {
                "application/json": {"example": {"detail": "loan or item not found"}}
            },
        },
    },
)
def update_loan(loan_id: int, payload: LoanUpdate) -> Loan:
    """
    Update a loan quantity.

    :param int loan_id: Loan ID
    :param LoanUpdate payload: Quantity to set
    :return Loan: Updated loan
    """
    with get_session() as session:
        try:
            if payload.quantity is None:
                raise HTTPException(status_code=400, detail="quantity is required")
            loan = svc.update_loan_quantity(session, loan_id, payload.quantity)
        except KeyError:
            raise HTTPException(status_code=404, detail="loan or item not found")
        except ValueError as e:
            detail = str(e)
            if detail in {"no availability", "loan already started"}:
                raise HTTPException(status_code=400, detail=detail)
            raise HTTPException(status_code=400, detail=detail)
        print("✅ Updated loan", loan.id)
        return loan


@router.post(
    "/{loan_id}/cancel",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancel loan",
    description="Cancel a future loan (delete) if it has not started yet.",
    responses={
        204: {"description": "Loan canceled"},
        400: {
            "description": "Loan already started",
            "content": {
                "application/json": {"example": {"detail": "loan already started"}}
            },
        },
    },
)
def cancel_loan(loan_id: int) -> Response:
    """Cancel a future loan; not allowed if loan has started."""
    with get_session() as session:
        try:
            svc.cancel_loan(session, loan_id)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        return Response(status_code=204)
