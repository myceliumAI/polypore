from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ShootCreate(BaseModel):
    """Payload to create a new shoot (tournage)."""

    name: str = Field(
        ..., description="Shoot/project name.", examples=["Promo 2025", "Clip A.B."]
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


class ShootUpdate(BaseModel):
    """Partial update for a shoot."""

    name: str | None = Field(
        default=None, description="New name.", examples=["Promo 2025 - Day 2"]
    )
    location: str | None = Field(
        default=None, description="New location.", examples=["Studio Y, Paris"]
    )
    start_date: datetime | None = Field(
        default=None,
        description="New start date-time (ISO UTC).",
        examples=["2025-09-27T09:00:00Z"],
    )
    end_date: datetime | None = Field(
        default=None,
        description="New end date-time (ISO UTC).",
        examples=["2025-09-27T18:00:00Z"],
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {"location": "Studio Y, Paris", "end_date": "2025-09-27T18:00:00Z"},
            ]
        }
    )
