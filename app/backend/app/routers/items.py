from fastapi import APIRouter, status

from ..db.core import get_session
from ..services import items as svc
from ..schemas.items import ItemCreate, ItemUpdate, ItemRead
from ..schemas.errors import ApiError, ErrorCode
from ..exceptions.api import (
    err_not_found,
    err_invalid_payload,
    err_internal,
    ApiException,
)

router = APIRouter(tags=["Items"])


@router.post(
    "/",
    response_model=ItemRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create item",
    description="Create a new inventory item.",
    response_description="Item created",
    responses={
        201: {"content": {"application/json": {"example": ItemRead.example() or {}}}},
        400: {
            "description": "Invalid payload",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INVALID_PAYLOAD)
                }
            },
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INTERNAL_ERROR)
                }
            },
        },
    },
)
def create_item(payload: ItemCreate) -> ItemRead:
    """
    Create a new inventory item.

    :param ItemCreate payload: New item data
    :return ItemRead: Created item
    """
    with get_session() as session:
        try:
            item = svc.create_item(
                session, payload.name, payload.type, payload.total_stock
            )
        except ValueError as e:
            raise err_invalid_payload(str(e))
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))
        print("✅ Created item", item.id)
        return ItemRead.model_validate(item)


@router.get(
    "/",
    response_model=list[ItemRead],
    status_code=status.HTTP_200_OK,
    summary="List items",
    description="List all inventory items.",
    response_description="List of items",
    responses={
        200: {"content": {"application/json": {"example": [ItemRead.example() or {}]}}},
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INTERNAL_ERROR)
                }
            },
        },
    },
)
def list_items() -> list[ItemRead]:
    """
    List all items.

    :return list[ItemRead]: Items
    """
    with get_session() as session:
        try:
            return [ItemRead.model_validate(x) for x in svc.list_items(session)]
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))


@router.patch(
    "/{item_id}",
    response_model=ItemRead,
    status_code=status.HTTP_200_OK,
    summary="Update item",
    description="Partially update an item (name/type/total_stock).",
    response_description="Updated item",
    responses={
        200: {"content": {"application/json": {"example": ItemRead.example() or {}}}},
        400: {
            "description": "Invalid update",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INVALID_PAYLOAD)
                }
            },
        },
        404: {
            "description": "Item not found",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.NOT_FOUND)
                }
            },
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INTERNAL_ERROR)
                }
            },
        },
    },
)
def update_item(item_id: int, payload: ItemUpdate) -> ItemRead:
    """
    Partially update an item.

    :param int item_id: Item ID
    :param ItemUpdate payload: Update fields
    :return ItemRead: Updated item
    """
    with get_session() as session:
        try:
            item = svc.update_item(
                session, item_id, payload.name, payload.type, payload.total_stock
            )
        except KeyError:
            raise err_not_found("item")
        except ValueError as e:
            raise err_invalid_payload(str(e))
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))
        print("✅ Updated item", item.id)
        return ItemRead.model_validate(item)


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete item",
    description="Delete an item by ID.",
    responses={
        204: {"description": "Item deleted"},
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INTERNAL_ERROR)
                }
            },
        },
    },
)
def delete_item(item_id: int) -> None:
    """
    Delete an item by ID.

    :param int item_id: Item ID
    """
    with get_session() as session:
        try:
            svc.delete_item(session, item_id)
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))
        print("✅ Deleted item", item_id)
        return None
