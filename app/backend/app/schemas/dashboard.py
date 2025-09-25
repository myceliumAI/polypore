from pydantic import BaseModel, Field, ConfigDict
from ..models.item import ItemType


class ItemAvailability(BaseModel):
    """
    Snapshot of per-item availability at a given instant (used in dashboard).
    """

    item_id: int = Field(
        ...,
        description="Item identifier",
        examples=[1, 42],
    )
    name: str = Field(
        ...,
        description="Item name",
        examples=["Canon C70", "Sony A7S III"],
    )
    type: ItemType = Field(
        ...,
        description="Item type/category",
        examples=["camera", "lens"],
    )
    total_stock: int = Field(
        ...,
        description="Total count owned",
        examples=[2, 10],
    )
    available_now: int = Field(
        ...,
        description="Quantity available right now",
        examples=[1, 5],
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
