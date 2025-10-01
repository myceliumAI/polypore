from datetime import datetime
from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .booking import Booking


class Shoot(SQLModel, table=True):
    """
    A shoot (tournage).
    """

    # Fields
    id: int | None = Field(default=None, primary_key=True)
    name: str
    location: str
    start_date: datetime
    end_date: datetime

    # Relationships
    bookings: list["Booking"] = Relationship(back_populates="shoot")
