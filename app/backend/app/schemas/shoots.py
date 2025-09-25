from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ShootCreate(BaseModel):
    """Payload to create a new shoot (tournage)."""

    name: str = Field(
        ...,
        description="Shoot/project name.",
        examples=["Promo 2025", "Clip A.B."],
    )
    location: str = Field(
        ...,
        description="Where the shoot happens (address or place).",
        examples=["Studio X, Paris", "Lyon - Parc Tête d'Or"],
    )
    start_date: datetime = Field(
        ...,
        description="ISO start date-time (UTC recommended).",
        examples=["2025-09-26T09:00:00Z"],
    )
    end_date: datetime = Field(
        ...,
        description="ISO end date-time (must be after start).",
        examples=["2025-09-26T18:00:00Z"],
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "name": "Promo 2025",
                    "location": "Studio X, Paris",
                    "start_date": "2025-09-26T09:00:00Z",
                    "end_date": "2025-09-26T18:00:00Z",
                }
            ]
        }
    )
