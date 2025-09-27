from pydantic import Field, ConfigDict
from ..models.item import ItemType
from .base import BaseSchema


class ItemAvailability(BaseSchema):
    """Snapshot of per-item availability at a given instant (used in dashboard)."""

    item_id: int = Field(
        ...,
        description="Item identifier",
        examples=[1],
    )
    name: str = Field(
        ...,
        description="Item name",
        examples=["Canon C70"],
    )
    type: ItemType = Field(
        ...,
        description="Item type/category",
        examples=["camera"],
    )
    total_stock: int = Field(
        ...,
        description="Total count owned",
        examples=[2],
    )
    available_now: int = Field(
        ...,
        description="Quantity available right now",
        examples=[1],
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "item_id": 1,
                    "name": "Canon C70",
                    "type": "camera",
                    "total_stock": 2,
                    "available_now": 1,
                }
            ]
        }
    )


class DayBreakdown(BaseSchema):
    """Breakdown of per-shoot reservations for a given day."""

    shoot_id: int = Field(
        ...,
        description="Shoot identifier",
        examples=[42],
    )
    shoot_name: str = Field(
        ...,
        description="Shoot name",
        examples=["Promo 2025"],
    )
    quantity: int = Field(
        ...,
        description="Reserved quantity for this shoot on the day",
        examples=[2],
    )


class DayAvailability(BaseSchema):
    """Daily availability for an item."""

    date: str = Field(
        ...,
        description="ISO date (YYYY-MM-DD)",
        examples=["2025-10-01"],
    )
    available: int = Field(
        ...,
        description="Available quantity that day",
        examples=[2],
    )
    total: int = Field(
        ...,
        description="Total stock for the item",
        examples=[5],
    )
    breakdown: list[DayBreakdown] = Field(
        default_factory=list,
        description="Per-shoot reservations",
        examples=[[{"shoot_id": 42, "shoot_name": "Promo 2025", "quantity": 2}]],
    )


class ItemTimeline(BaseSchema):
    """Timeline of availability for an item."""

    item_id: int = Field(
        ...,
        examples=[1],
    )
    name: str = Field(
        ...,
        examples=["Canon C70"],
    )
    type: ItemType = Field(
        ...,
        examples=["camera"],
    )
    series: list[DayAvailability] = Field(
        ...,
        examples=[
            [{"date": "2025-10-01", "available": 1, "total": 2, "breakdown": []}],
        ],
    )


class TypeTimeline(BaseSchema):
    """Timeline of availability for an item type."""

    type: ItemType = Field(
        ...,
        description="Item type/category",
        examples=["camera"],
    )
    series: list[DayAvailability] = Field(
        ...,
        description="Daily availability for the type",
        examples=[
            [{"date": "2025-10-01", "available": 3, "total": 5, "breakdown": []}]
        ],
    )
