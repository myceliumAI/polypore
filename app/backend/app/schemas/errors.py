from enum import StrEnum
from pydantic import Field, ConfigDict

from .base import BaseSchema


class ErrorCode(StrEnum):
    NOT_FOUND = "NOT_FOUND"
    INVALID_PAYLOAD = "INVALID_PAYLOAD"
    INVALID_DATES = "INVALID_DATES"
    NO_AVAILABILITY = "NO_AVAILABILITY"
    BOOKING_ALREADY_STARTED = "BOOKING_ALREADY_STARTED"
    INTERNAL_ERROR = "INTERNAL_ERROR"


class ApiError(BaseSchema):
    """Uniform API error schema used for both runtime responses and Swagger."""

    detail: str = Field(
        ...,
        description="Error message.",
        examples=[" ❌ item not found"],
    )
    code: ErrorCode = Field(
        ...,
        description="Machine-readable error code.",
        examples=[ErrorCode.NOT_FOUND],
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {"detail": " ❌ item not found", "code": "NOT_FOUND"},
                {
                    "detail": " ❌ Invalid payload: total_stock must be >= 0",
                    "code": "INVALID_PAYLOAD",
                },
                {
                    "detail": " ❌ Invalid dates: end_date must be after start_date",
                    "code": "INVALID_DATES",
                },
                {
                    "detail": " ❌ No availability for requested period",
                    "code": "NO_AVAILABILITY",
                },
                {
                    "detail": " ❌ Booking already started",
                    "code": "BOOKING_ALREADY_STARTED",
                },
                {"detail": " ❌ Internal server error", "code": "INTERNAL_ERROR"},
            ]
        }
    )

    @classmethod
    def example_for(cls, code: ErrorCode, detail: str | None = None) -> dict:
        """
        Return a tailored example payload for a given error code.

        :param ErrorCode code: Target error code
        :param str | None detail: Override default message
        :return dict: Example payload
        """
        defaults = {
            ErrorCode.NOT_FOUND: " ❌ resource not found",
            ErrorCode.INVALID_PAYLOAD: " ❌ Invalid payload",
            ErrorCode.INVALID_DATES: " ❌ Invalid dates: end_date must be after start_date",
            ErrorCode.NO_AVAILABILITY: " ❌ No availability for requested period",
            ErrorCode.BOOKING_ALREADY_STARTED: " ❌ Booking already started",
            ErrorCode.INTERNAL_ERROR: " ❌ Internal server error",
        }
        message = detail if detail is not None else defaults.get(code, " ❌ Error")
        return {"detail": message, "code": code}
