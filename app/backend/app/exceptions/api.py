from fastapi import HTTPException, status

from ..schemas.errors import ApiError, ErrorCode


class ApiException(HTTPException):
    """
    HTTPException carrying a structured ApiError payload.

    :param int status_code: HTTP status code
    :param ApiError error: Error DTO
    :return ApiException: Raise to return
    """

    def __init__(self, status_code: int, error: ApiError):
        super().__init__(status_code=status_code, detail=error.model_dump())


def err_not_found(entity: str) -> ApiException:
    """
    Return a 404 Not Found error.

    :param str entity: Entity name
    :return ApiException: 404 error
    """
    return ApiException(
        status.HTTP_404_NOT_FOUND,
        ApiError(detail=f" ❌ {entity} not found", code=ErrorCode.NOT_FOUND),
    )


def err_invalid_payload(reason: str) -> ApiException:
    """
    Return a 400 Bad Request error.

    :param str reason: Reason for the error
    :return ApiException: 400 error
    """
    return ApiException(
        status.HTTP_400_BAD_REQUEST,
        ApiError(
            detail=f" ❌ Invalid payload: {reason}", code=ErrorCode.INVALID_PAYLOAD
        ),
    )


def err_invalid_dates() -> ApiException:
    """
    Return a 400 Bad Request error.

    :return ApiException: 400 error
    """
    return ApiException(
        status.HTTP_400_BAD_REQUEST,
        ApiError(
            detail=" ❌ Invalid dates: end_date must be after start_date",
            code=ErrorCode.INVALID_DATES,
        ),
    )


def err_no_availability() -> ApiException:
    return ApiException(
        status.HTTP_400_BAD_REQUEST,
        ApiError(
            detail=" ❌ No availability for requested period",
            code=ErrorCode.NO_AVAILABILITY,
        ),
    )


def err_loan_started() -> ApiException:
    """
    Return a 400 Bad Request error.

    :return ApiException: 400 error
    """
    return ApiException(
        status.HTTP_400_BAD_REQUEST,
        ApiError(
            detail=" ❌ Loan already started", code=ErrorCode.LOAN_ALREADY_STARTED
        ),
    )


def err_internal(message: str = "Internal server error") -> ApiException:
    """
    Return a 500 Internal Server Error error.

    :param str message: Error message
    :return ApiException: 500 error
    """
    return ApiException(
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        ApiError(detail=f" ❌ {message}", code=ErrorCode.INTERNAL_ERROR),
    )
