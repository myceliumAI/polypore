from fastapi import APIRouter, HTTPException, status

from ..db.core import get_session
from ..services import items as svc
from ..models.item import Item
from ..schemas.items import ItemCreate, ItemUpdate

router = APIRouter(tags=["Items"])


@router.post(
    "/",
    response_model=Item,
    status_code=status.HTTP_201_CREATED,
    summary="Create item",
    description="Create a new inventory item.",
    response_description="Item created",
    responses={
        201: {
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "Canon C70",
                        "type": "camera",
                        "total_stock": 2,
                    }
                }
            }
        },
        400: {
            "description": "Invalid payload",
            "content": {
                "application/json": {"example": {"detail": "total_stock must be >= 0"}}
            },
        },
    },
)
def create_item(payload: ItemCreate) -> Item:
    """
    Create a new inventory item.

    :param ItemCreate payload: New item data
    :return Item: Created item
    """
    with get_session() as session:
        try:
            item = svc.create_item(
                session, payload.name, payload.type, payload.total_stock
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        print("✅ Created item", item.id)
        return item


@router.get(
    "/",
    response_model=list[Item],
    status_code=status.HTTP_200_OK,
    summary="List items",
    description="List all inventory items.",
    response_description="List of items",
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "name": "Canon C70",
                            "type": "camera",
                            "total_stock": 2,
                        }
                    ]
                }
            }
        },
    },
)
def list_items() -> list[Item]:
    """
    List all items.

    :return list[Item]: Items
    """
    with get_session() as session:
        return svc.list_items(session)


@router.patch(
    "/{item_id}",
    response_model=Item,
    status_code=status.HTTP_200_OK,
    summary="Update item",
    description="Partially update an item (name/type/total_stock).",
    response_description="Updated item",
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "Canon C70 Kit A",
                        "type": "camera",
                        "total_stock": 3,
                    }
                }
            }
        },
        400: {
            "description": "Invalid update",
            "content": {
                "application/json": {"example": {"detail": "total_stock must be >= 0"}}
            },
        },
        404: {
            "description": "Item not found",
            "content": {"application/json": {"example": {"detail": "item not found"}}},
        },
    },
)
def update_item(item_id: int, payload: ItemUpdate) -> Item:
    """
    Partially update an item.

    :param int item_id: Item ID
    :param ItemUpdate payload: Update fields
    :return Item: Updated item
    """
    with get_session() as session:
        try:
            item = svc.update_item(
                session, item_id, payload.name, payload.type, payload.total_stock
            )
        except KeyError:
            raise HTTPException(status_code=404, detail="item not found")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        print("✅ Updated item", item.id)
        return item


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete item",
    description="Delete an item by ID.",
    responses={
        204: {"description": "Item deleted"},
    },
)
def delete_item(item_id: int) -> None:
    """
    Delete an item by ID.

    :param int item_id: Item ID
    """
    with get_session() as session:
        svc.delete_item(session, item_id)
        print("✅ Deleted item", item_id)
        return None
