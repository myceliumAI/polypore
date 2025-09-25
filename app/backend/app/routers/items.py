from fastapi import APIRouter
from sqlmodel import select

from ..db.core import get_session
from ..models.item import Item
from ..schemas.items import ItemCreate

router = APIRouter()


@router.post("/", response_model=Item)
def create_item(payload: ItemCreate) -> Item:
    """
    Create a new inventory item.

    :param ItemCreate payload: New item data
    :return Item: Created item with ID
    """
    with get_session() as session:
        item = Item(
            name=payload.name, type=payload.type, total_stock=payload.total_stock
        )
        session.add(item)
        session.commit()
        session.refresh(item)
        print("✅ Created item", item.id)
        return item


@router.get("/", response_model=list[Item])
def list_items() -> list[Item]:
    """
    List all items in the inventory.

    :return list[Item]: Items
    """
    with get_session() as session:
        return session.exec(select(Item)).all()
