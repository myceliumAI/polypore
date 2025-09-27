from pydantic import Field, ConfigDict
from ..models.item import ItemType
from .base import BaseSchema


class ItemCreate(BaseSchema):
    """Payload to create a new inventory item."""

    name: str = Field(
        ...,
        description="Human-friendly item name.",
        examples=["Canon C70", "Aputure 120d II"],
    )
    type: ItemType = Field(
        ...,
        description="Item category/type.",
        examples=[ItemType.CAMERA, ItemType.LIGHT],
    )
    total_stock: int = Field(
        ...,
        ge=0,
        description="Total count owned in inventory.",
        examples=[1, 3, 10],
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {"name": "Canon C70", "type": "camera", "total_stock": 2},
            ],
        }
    )


class ItemUpdate(BaseSchema):
    """Partial update for an inventory item."""

    name: str | None = Field(
        default=None,
        description="New name.",
        examples=["Canon C70 (Kit A)"],
    )
    type: ItemType | None = Field(
        default=None,
        description="New category.",
        examples=[ItemType.CABLE],
    )
    total_stock: int | None = Field(
        default=None,
        ge=0,
        description="New total stock (>=0).",
        examples=[5],
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {"name": "Lens Olympus 25mm", "total_stock": 4},
            ],
        }
    )


class ItemRead(BaseSchema):
    """
    Response schema for an item.

    :param int id: Item ID
    :param str name: Item name
    :param ItemType type: Item type
    :param int total_stock: Total stock
    :return ItemRead: Item representation
    """

    id: int = Field(
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
    total_stock: int = Field(
        ...,
        examples=[2],
    )

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {"id": 1, "name": "Canon C70", "type": "camera", "total_stock": 2},
            ],
        },
    )
