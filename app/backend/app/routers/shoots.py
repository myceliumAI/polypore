from fastapi import APIRouter, HTTPException, Response, status

from ..db.core import get_session
from ..services import shoots as svc
from ..schemas.shoots import ShootCreate, ShootUpdate
from ..models.shoot import Shoot

router = APIRouter(tags=["Shoots"])


@router.post(
    "/",
    response_model=Shoot,
    status_code=status.HTTP_201_CREATED,
    summary="Create shoot",
    description="Create a new shoot (tournage) with name, location, and date range.",
    response_description="Shoot created",
    responses={
        201: {
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "Promo 2025",
                        "location": "Studio X",
                        "start_date": "2025-09-26T09:00:00Z",
                        "end_date": "2025-09-26T18:00:00Z",
                    }
                }
            }
        },
        400: {
            "description": "Invalid dates",
            "content": {
                "application/json": {
                    "example": {"detail": "end_date must be after start_date"}
                }
            },
        },
    },
)
def create_shoot(payload: ShootCreate) -> Shoot:
    """
    Create a new shoot.

    :param ShootCreate payload: Shoot information
    :return Shoot: Created shoot
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
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        print("✅ Created shoot", shoot.id)
        return shoot


@router.get(
    "/",
    response_model=list[Shoot],
    status_code=status.HTTP_200_OK,
    summary="List shoots",
    description="List all shoots.",
    response_description="List of shoots",
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "name": "Promo 2025",
                            "location": "Studio X",
                            "start_date": "2025-09-26T09:00:00Z",
                            "end_date": "2025-09-26T18:00:00Z",
                        }
                    ]
                }
            }
        },
    },
)
def list_shoots() -> list[Shoot]:
    with get_session() as session:
        return svc.list_shoots(session)


@router.patch(
    "/{shoot_id}",
    response_model=Shoot,
    status_code=status.HTTP_200_OK,
    summary="Update shoot",
    description="Partially update a shoot (name/location/dates).",
    response_description="Updated shoot",
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "name": "Promo Day 2",
                        "location": "Studio Y",
                        "start_date": "2025-09-27T09:00:00Z",
                        "end_date": "2025-09-27T18:00:00Z",
                    }
                }
            }
        },
        400: {
            "description": "Invalid dates",
            "content": {
                "application/json": {
                    "example": {"detail": "end_date must be after start_date"}
                }
            },
        },
        404: {
            "description": "Shoot not found",
            "content": {"application/json": {"example": {"detail": "shoot not found"}}},
        },
    },
)
def update_shoot(shoot_id: int, payload: ShootUpdate) -> Shoot:
    """
    Update a shoot.

    :param int shoot_id: Shoot ID
    :param ShootUpdate payload: Shoot information
    :return Shoot: Updated shoot
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
            raise HTTPException(status_code=404, detail="shoot not found")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        print("✅ Updated shoot", shoot.id)
        return shoot


@router.delete(
    "/{shoot_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete shoot",
    description="Delete a shoot and cascade-delete its loans.",
    responses={204: {"description": "Shoot deleted"}},
)
def delete_shoot(shoot_id: int) -> None:
    """
    Delete a shoot.

    :param int shoot_id: Shoot ID
    """
    with get_session() as session:
        deleted = svc.delete_shoot(session, shoot_id)
        print("✅ Deleted shoot and", deleted, "related loan(s)")
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
            "content": {"application/json": {"example": {"detail": "shoot not found"}}},
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
            raise HTTPException(status_code=404, detail="shoot not found")
        filename = f"shoot_{shoot_id}_packing_list.csv"
        headers = {"Content-Disposition": f"attachment; filename={filename}"}
        return Response(content=content, media_type="text/csv", headers=headers)
