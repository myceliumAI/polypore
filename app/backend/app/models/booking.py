from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel

from .item import Item
from .shoot import Shoot


class Booking(SQLModel, table=True):
    """
    A booking of an item for a shoot.
    """

    # Fields
    id: int | None = Field(default=None, primary_key=True)
    item_id: int = Field(foreign_key="item.id", index=True)
    shoot_id: int = Field(foreign_key="shoot.id", index=True)
    quantity: int = Field(ge=1)
    start_date: datetime
    end_date: datetime
    returned_at: datetime | None = None

    # Relationships
    item: "Item" = Relationship(back_populates="bookings")
    shoot: "Shoot" = Relationship(back_populates="bookings")
