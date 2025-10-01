from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .booking import Booking


class ItemType(str, Enum):
    """
    The type of an item.
    """

    CAMERA = "camera"
    LIGHT = "light"
    CABLE = "cable"
    OTHER = "other"


class Item(SQLModel, table=True):
    """
    An item in the stock.
    """

    # Fields
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    type: ItemType = Field(index=True)
    total_stock: int = Field(ge=0, default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    bookings: list["Booking"] = Relationship(back_populates="item")
