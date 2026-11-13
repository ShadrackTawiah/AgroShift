
from typing import Literal, Optional, Dict, Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.algorithms.crop_rotation import recommend_crop_rotation


router = APIRouter(
    prefix="/api/crop-rotation",
    tags=["Crop Rotation"]
)


class CropRotationRequest(BaseModel):
    previous_crop: str = Field(
        ...,
        description="The crop previously planted on the farm."
    )

    priority: Literal[
        "soil_improvement",
        "water_conservation",
        "drought_resilience",
        "balanced"
    ] = "balanced"

    water_availability: Literal[
        "low",
        "medium",
        "high"
    ] = "medium"

    latitude: Optional[float] = Field(
        default=None,
        ge=-90,
        le=90
    )

    longitude: Optional[float] = Field(
        default=None,
        ge=-180,
        le=180
    )

    climate_summary: Optional[Dict[str, Any]] = None

    number_of_recommendations: int = Field(
        default=5,
        ge=1,
        le=9
    )


@router.post("/recommend")
def get_crop_recommendations(request: CropRotationRequest):

    if (request.latitude is None) != (request.longitude is None):
        raise HTTPException(
            status_code=400,
            detail="Latitude and longitude must be provided together."
        )

    try:
        result = recommend_crop_rotation(
            previous_crop=request.previous_crop,
            priority=request.priority,
            water_availability=request.water_availability,
            number_of_recommendations=request.number_of_recommendations,
            climate_summary=request.climate_summary,
        )

        result["farm_location"] = None

        if request.latitude is not None:
            result["farm_location"] = {
                "latitude": request.latitude,
                "longitude": request.longitude
            }

        result["climate_context"] = request.climate_summary

        return {
            "status": "success",
            "message": "Crop rotation recommendations generated.",
            "result": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
