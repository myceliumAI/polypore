from fastapi import APIRouter, Response, status

from ..db.core import get_session
from ..services import shoots as svc
from ..schemas.shoots import ShootCreate, ShootUpdate, ShootRead
from ..schemas.errors import ApiError, ErrorCode
from ..exceptions.api import (
    err_not_found,
    err_invalid_dates,
    err_internal,
    ApiException,
)

router = APIRouter(tags=["Shoots"])


@router.post(
    "/",
    response_model=ShootRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create shoot",
    description="Create a new shoot (tournage) with name, location, and date range.",
    response_description="Shoot created",
    responses={
        201: {"content": {"application/json": {"example": ShootRead.example() or {}}}},
        400: {
            "description": "Invalid dates",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INVALID_DATES)
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
def create_shoot(payload: ShootCreate) -> ShootRead:
    """
    Create a new shoot.

    :param ShootCreate payload: Shoot information
    :return ShootRead: Created shoot
    """
    with get_session() as session:
        try:
            shoot = svc.create_shoot(
                session,
                payload.name,
                payload.location,
                payload.start_date,
                payload.end_date,
            )
        except ValueError:
            raise err_invalid_dates()
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))
        print("✅ Created shoot", shoot.id)
        return ShootRead.model_validate(shoot)


@router.get(
    "/",
    response_model=list[ShootRead],
    status_code=status.HTTP_200_OK,
    summary="List shoots",
    description="List all shoots.",
    response_description="List of shoots",
    responses={
        200: {
            "content": {"application/json": {"example": [ShootRead.example() or {}]}}
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
def list_shoots() -> list[ShootRead]:
    with get_session() as session:
        try:
            return [ShootRead.model_validate(x) for x in svc.list_shoots(session)]
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))


@router.patch(
    "/{shoot_id}",
    response_model=ShootRead,
    status_code=status.HTTP_200_OK,
    summary="Update shoot",
    description="Partially update a shoot (name/location/dates).",
    response_description="Updated shoot",
    responses={
        200: {"content": {"application/json": {"example": ShootRead.example() or {}}}},
        400: {
            "description": "Invalid dates",
            "content": {
                "application/json": {
                    "example": ApiError.example_for(ErrorCode.INVALID_DATES)
                }
            },
        },
        404: {
            "description": "Shoot not found",
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
def update_shoot(shoot_id: int, payload: ShootUpdate) -> ShootRead:
    """
    Update a shoot.

    :param int shoot_id: Shoot ID
    :param ShootUpdate payload: Shoot information
    :return ShootRead: Updated shoot
    """
    with get_session() as session:
        try:
            shoot = svc.update_shoot(
                session,
                shoot_id,
                payload.name,
                payload.location,
                payload.start_date,
                payload.end_date,
            )
        except KeyError:
            raise err_not_found("shoot")
        except ValueError:
            raise err_invalid_dates()
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))
        print("✅ Updated shoot", shoot.id)
        return ShootRead.model_validate(shoot)


@router.delete(
    "/{shoot_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete shoot",
    description="Delete a shoot and cascade-delete its bookings.",
    responses={
        204: {"description": "Shoot deleted"},
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
def delete_shoot(shoot_id: int) -> None:
    """
    Delete a shoot.

    :param int shoot_id: Shoot ID
    """
    with get_session() as session:
        try:
            deleted = svc.delete_shoot(session, shoot_id)
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))
        print(" ✅ Deleted shoot and", deleted, "related booking(s)")
        return None


@router.get(
    "/{shoot_id}/packing-list.csv",
    summary="Export packing list (CSV)",
    description="Export a CSV of items and quantities to take for the shoot.",
    responses={
        200: {
            "content": {
                "text/csv": {
                    "example": "item_id,item_name,item_type,quantity\n1,Canon C70,camera,2\n"
                }
            }
        },
        404: {
            "description": "Shoot not found",
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
def packing_list_csv(shoot_id: int) -> Response:
    """Export a CSV of items and quantities to take for the shoot.

    :param int shoot_id: Shoot ID
    :return Response: Response
    """
    with get_session() as session:
        try:
            content = svc.build_packing_list_csv(session, shoot_id)
        except KeyError:
            raise err_not_found("shoot")
        except ApiException:
            raise
        except Exception as e:
            raise err_internal(str(e))
        filename = f"shoot_{shoot_id}_packing_list.csv"
        headers = {"Content-Disposition": f"attachment; filename={filename}"}
        return Response(content=content, media_type="text/csv", headers=headers)
