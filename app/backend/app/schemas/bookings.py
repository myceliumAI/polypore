from pydantic import Field, ConfigDict
from .base import BaseSchema


class BookingCreate(BaseSchema):
    """Payload to create a new booking (reservation) for a given shoot and item."""

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
        description="Quantity to book.",
        examples=[1, 2],
    )
    description: str | None = Field(
        default=None,
        description="Optional human description or reason for the booking.",
        examples=["Backup light for scene 2"],
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {"item_id": 1, "shoot_id": 42, "quantity": 1},
            ],
        }
    )


class BookingUpdate(BaseSchema):
    """Partial update for a booking (item_id, shoot_id, quantity, description)."""

    item_id: int | None = Field(
        default=None,
        ge=1,
        description="New item id (optional)",
        examples=[2],
    )
    shoot_id: int | None = Field(
        default=None,
        ge=1,
        description="New shoot id (optional)",
        examples=[3],
    )
    quantity: int | None = Field(
        default=None,
        description="New quantity.",
        ge=1,
        examples=[2],
    )
    description: str | None = Field(
        default=None,
        description="New description (optional).",
        examples=["Changed due to client request"],
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {"quantity": 2},
                {"item_id": 2},
                {"shoot_id": 3},
                {"item_id": 2, "shoot_id": 3, "quantity": 1},
            ]
        }
    )


class BookingRead(BaseSchema):
    """
    Response schema for a booking.

    :param int id: Booking ID
    :param int item_id: Item ID
    :param int shoot_id: Shoot ID
    :param int quantity: Quantity
    :return BookingRead: Booking representation
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
    description: str | None = Field(default=None)

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {"id": 1, "item_id": 1, "shoot_id": 42, "quantity": 1},
            ],
        },
    )
