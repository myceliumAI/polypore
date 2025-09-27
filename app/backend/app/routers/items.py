from fastapi import APIRouter, HTTPException
from sqlmodel import select

from ..db.core import get_session
from ..models.item import Item
from ..schemas.items import ItemCreate, ItemUpdate

router = APIRouter()


@router.post("/", response_model=Item)
def create_item(payload: ItemCreate) -> Item:
    """Create a new inventory item.

    :param ItemCreate payload: Item information
    :return Item: Created item
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
    with get_session() as session:
        return session.exec(select(Item)).all()


@router.patch("/{item_id}", response_model=Item)
def update_item(item_id: int, payload: ItemUpdate) -> Item:
    """Partially update an item (name, type, total_stock).

    :param int item_id: Item ID
    :param ItemUpdate payload: Item information
    :return Item: Updated item
    """
    with get_session() as session:
        item = session.get(Item, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="item not found")
        if payload.name is not None:
            item.name = payload.name
        if payload.type is not None:
            item.type = payload.type
        if payload.total_stock is not None:
            if payload.total_stock < 0:
                raise HTTPException(status_code=400, detail="total_stock must be >= 0")
            item.total_stock = payload.total_stock
        session.add(item)
        session.commit()
        session.refresh(item)
        print("✅ Updated item", item.id)
        return item


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int) -> None:
    """Delete an item.

    :param int item_id: Item ID
    """
    with get_session() as session:
        item = session.get(Item, item_id)
        if not item:
            return None
        session.delete(item)
        session.commit()
        print("✅ Deleted item", item_id)
        return None
