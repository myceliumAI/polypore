from pydantic import Field, ConfigDict
from .base import BaseSchema


class LoanCreate(BaseSchema):
    """Payload to create a new loan (reservation) for a given shoot and item."""

    item_id: int = Field(
        ...,
        ge=1,
        description="Target item identifier.",
        examples=[1],
    )
    shoot_id: int = Field(
        ...,
        ge=1,
        description="Target shoot identifier.",
        examples=[1],
    )
    quantity: int = Field(
        ...,
        ge=1,
        description="Quantity to loan.",
        examples=[1, 2],
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {"item_id": 1, "shoot_id": 42, "quantity": 1},
            ],
        }
    )


class LoanUpdate(BaseSchema):
    """Partial update for a loan (quantity only in this POC)."""

    quantity: int | None = Field(
        default=None,
        description="New quantity.",
        ge=1,
        examples=[2],
    )

    model_config = ConfigDict(json_schema_extra={"examples": [{"quantity": 2}]})


class LoanRead(BaseSchema):
    """
    Response schema for a loan.

    :param int id: Loan ID
    :param int item_id: Item ID
    :param int shoot_id: Shoot ID
    :param int quantity: Quantity
    :return LoanRead: Loan representation
    """

    id: int = Field(
        ...,
        examples=[1],
    )
    item_id: int = Field(
        ...,
        examples=[1],
    )
    shoot_id: int = Field(
        ...,
        examples=[42],
    )
    quantity: int = Field(
        ...,
        examples=[1],
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {"id": 1, "item_id": 1, "shoot_id": 42, "quantity": 1},
            ],
        },
    )
