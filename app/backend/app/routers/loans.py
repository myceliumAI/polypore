from fastapi import APIRouter, Response, status

from ..db.core import get_session
from ..services import loans as svc
from ..schemas.loans import LoanCreate, LoanUpdate, LoanRead
from ..schemas.errors import ApiError, ErrorCode
from ..exceptions.api import (
    err_not_found,
    err_invalid_payload,
    err_no_availability,
    err_loan_started,
    err_internal,
    ApiException,
)

router = APIRouter(tags=["Loans"])


@router.post(
    "/",
    response_model=LoanRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create loan",
    description="Create a loan for an item on a given shoot with availability checks.",
    response_description="Loan created",
    responses={
        201: {"content": {"application/json": {"example": LoanRead.example() or {}}}},
        400: {
            "description": "No availability or invalid payload",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.NO_AVAILABILITY)
                }
            },
        },
        404: {
            "description": "Item or shoot not found",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.NOT_FOUND)
                }
            },
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INTERNAL_ERROR)
                }
            },
        },
    },
)
def create_loan(payload: LoanCreate) -> LoanRead:
    """
    Create a new loan.

    :param LoanCreate payload: Loan payload
    :return LoanRead: Created loan
    """
    with get_session() as session:
        try:
            loan = svc.create_loan(
                session, payload.item_id, payload.shoot_id, payload.quantity
            )
        except KeyError:
            raise err_not_found("item or shoot")
        except ValueError as e:
            detail = str(e)
            if detail == "no availability":
                raise err_no_availability()
            raise err_invalid_payload(detail)
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))
        print("✅ Created loan", loan.id)
        return LoanRead.model_validate(loan)


@router.get(
    "/",
    response_model=list[LoanRead],
    status_code=status.HTTP_200_OK,
    summary="List loans",
    description="List all loans.",
    response_description="List of loans",
    responses={
        200: {"content": {"application/json": {"example": [LoanRead.example() or {}]}}},
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INTERNAL_ERROR)
                }
            },
        },
    },
)
def list_loans() -> list[LoanRead]:
    with get_session() as session:
        try:
            return [LoanRead.model_validate(x) for x in svc.list_loans(session)]
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))


@router.patch(
    "/{loan_id}",
    response_model=LoanRead,
    status_code=status.HTTP_200_OK,
    summary="Update loan quantity",
    description="Update quantity of a future loan after re-checking availability.",
    response_description="Updated loan",
    responses={
        200: {"content": {"application/json": {"example": LoanRead.example() or {}}}},
        400: {
            "description": "Invalid payload or loan started",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.LOAN_ALREADY_STARTED)
                }
            },
        },
        404: {
            "description": "Loan or item not found",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.NOT_FOUND)
                }
            },
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INTERNAL_ERROR)
                }
            },
        },
    },
)
def update_loan(loan_id: int, payload: LoanUpdate) -> LoanRead:
    """
    Update a loan quantity.

    :param int loan_id: Loan ID
    :param LoanUpdate payload: Quantity to set
    :return LoanRead: Updated loan
    """
    with get_session() as session:
        try:
            if payload.quantity is None:
                raise err_invalid_payload("quantity is required")
            loan = svc.update_loan_quantity(session, loan_id, payload.quantity)
        except KeyError:
            raise err_not_found("loan or item")
        except ValueError as e:
            detail = str(e)
            if detail == "no availability":
                raise err_no_availability()
            if detail == "loan already started":
                raise err_loan_started()
            raise err_invalid_payload(detail)
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))
        print("✅ Updated loan", loan.id)
        return LoanRead.model_validate(loan)


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
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.LOAN_ALREADY_STARTED)
                }
            },
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INTERNAL_ERROR)
                }
            },
        },
    },
)
def cancel_loan(loan_id: int) -> Response:
    """Cancel a future loan; not allowed if loan has started."""
    with get_session() as session:
        try:
            svc.cancel_loan(session, loan_id)
        except ValueError:
            raise err_loan_started()
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))
        return Response(status_code=204)
