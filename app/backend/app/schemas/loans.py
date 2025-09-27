from pydantic import BaseModel, Field, ConfigDict


class LoanCreate(BaseModel):
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
            ]
        }
    )


class LoanUpdate(BaseModel):
    """Partial update for a loan (quantity only in this POC)."""

    quantity: int | None = Field(
        default=None,
        description="New quantity.",
        ge=1,
        examples=[2],
    )

    model_config = ConfigDict(json_schema_extra={"examples": [{"quantity": 2}]})
