from fastapi import APIRouter, Response, status

from ..db.core import get_session
from ..services import bookings as svc
from ..schemas.bookings import BookingCreate, BookingUpdate, BookingRead
from ..schemas.errors import ApiError, ErrorCode
from ..exceptions.api import (
    err_not_found,
    err_invalid_payload,
    err_no_availability,
    err_booking_started,
    err_internal,
    ApiException,
)

router = APIRouter(tags=["Bookings"])


@router.post(
    "/",
    response_model=BookingRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create booking",
    description="Create a booking for an item on a given shoot with availability checks.",
    response_description="Booking created",
    responses={
        201: {
            "content": {"application/json": {"example": BookingRead.example() or {}}}
        },
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
def create_booking(payload: BookingCreate) -> BookingRead:
    """
    Create a new booking.

    :param BookingCreate payload: Booking payload
    :return BookingRead: Created booking
    """
    with get_session() as session:
        try:
            booking = svc.create_booking(
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
        print(" ✅ Created booking", booking.id)
        return BookingRead.model_validate(booking)


@router.get(
    "/",
    response_model=list[BookingRead],
    status_code=status.HTTP_200_OK,
    summary="List bookings",
    description="List all bookings.",
    response_description="List of bookings",
    responses={
        200: {
            "content": {"application/json": {"example": [BookingRead.example() or {}]}}
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
def list_bookings() -> list[BookingRead]:
    with get_session() as session:
        try:
            return [BookingRead.model_validate(x) for x in svc.list_bookings(session)]
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))


@router.patch(
    "/{booking_id}",
    response_model=BookingRead,
    status_code=status.HTTP_200_OK,
    summary="Update booking quantity",
    description="Update quantity of a future booking after re-checking availability.",
    response_description="Updated booking",
    responses={
        200: {
            "content": {"application/json": {"example": BookingRead.example() or {}}}
        },
        400: {
            "description": "Invalid payload or booking started",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.BOOKING_ALREADY_STARTED)
                }
            },
        },
        404: {
            "description": "Booking or item not found",
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
def update_booking(booking_id: int, payload: BookingUpdate) -> BookingRead:
    """
    Update a booking quantity.

    :param int booking_id: Booking ID
    :param BookingUpdate payload: Quantity to set
    :return BookingRead: Updated booking
    """
    with get_session() as session:
        try:
            if payload.quantity is None:
                raise err_invalid_payload("quantity is required")
            booking = svc.update_booking_quantity(session, booking_id, payload.quantity)
        except KeyError:
            raise err_not_found("booking or item")
        except ValueError as e:
            detail = str(e)
            if detail == "no availability":
                raise err_no_availability()
            if detail == "booking already started":
                raise err_booking_started()
            raise err_invalid_payload(detail)
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))
        print(" ✅ Updated booking", booking.id)
        return BookingRead.model_validate(booking)


@router.post(
    "/{booking_id}/cancel",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancel booking",
    description="Cancel a future booking (delete) if it has not started yet.",
    responses={
        204: {"description": "Booking canceled"},
        400: {
            "description": "Booking already started",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.BOOKING_ALREADY_STARTED)
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
def cancel_booking(booking_id: int) -> Response:
    """Cancel a future booking; not allowed if booking has started."""
    with get_session() as session:
        try:
            svc.cancel_booking(session, booking_id)
        except ValueError:
            raise err_booking_started()
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))
        return Response(status_code=204)
