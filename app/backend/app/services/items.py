from typing import List
from sqlmodel import Session, select

from ..models.item import Item, ItemType


def list_items(session: Session) -> List[Item]:
    """
    Return all stock items.

    :param Session session: Active database session.
    :return List[Item]: List of items.
    """
    return session.exec(select(Item)).all()


def create_item(session: Session, name: str, type_: ItemType, total_stock: int) -> Item:
    """
    Create a new stock item.

    :param Session session: Active database session.
    :param str name: Human-readable item name.
    :param ItemType type_: Item category/type.
    :param int total_stock: Total stock owned (must be >= 0).
    :return Item: The created item.
    """
    if total_stock < 0:
        raise ValueError("total_stock must be >= 0")
    item = Item(name=name, type=type_, total_stock=total_stock)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def update_item(
    session: Session,
    item_id: int,
    name: str | None,
    type_: ItemType | None,
    total_stock: int | None,
) -> Item:
    """
    Partially update a stock item.

    :param Session session: Active database session.
    :param int item_id: Target item identifier.
    :param str|None name: New name if provided.
    :param ItemType|None type_: New type if provided.
    :param int|None total_stock: New total stock (>= 0) if provided.
    :return Item: The updated item.
    """
    item = session.get(Item, item_id)
    if not item:
        raise KeyError("item not found")
    if name is not None:
        item.name = name
    if type_ is not None:
        item.type = type_
    if total_stock is not None:
        if total_stock < 0:
            raise ValueError("total_stock must be >= 0")
        item.total_stock = total_stock
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def delete_item(session: Session, item_id: int) -> None:
    """
    Delete an item if it exists.

    :param Session session: Active database session.
    :param int item_id: Target item identifier.
    """
    item = session.get(Item, item_id)
    if not item:
        return None
    session.delete(item)
    session.commit()
    return None
