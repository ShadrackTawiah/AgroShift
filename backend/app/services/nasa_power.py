import httpx
from datetime import date

from fastapi import APIRouter, HTTPException, Query

router = APIRouter(
    prefix="/api/climate",
    tags=["NASA Climate Data"]
)

NASA_POWER_URL = (
    "https://power.larc.nasa.gov/api/temporal/daily/point"
)

CLIMATE_PARAMETERS = (
    "T2M,T2M_MAX,T2M_MIN,"
    "PRECTOTCORR,ALLSKY_SFC_SW_DWN"
)


async def fetch_nasa_climate(latitude, longitude, start_date, end_date):
    params = {
        "parameters": CLIMATE_PARAMETERS,
        "community": "AG",
        "longitude": longitude,
        "latitude": latitude,
        "start": start_date.strftime("%Y%m%d"),
        "end": end_date.strftime("%Y%m%d"),
        "format": "JSON",
        "time-standard": "UTC",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                NASA_POWER_URL,
                params=params
            )
            response.raise_for_status()
            nasa_data = response.json()

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=502,
            detail=f"NASA POWER returned HTTP {error.response.status_code}"
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to NASA POWER. Please try again."
        )

    try:
        climate_data = nasa_data["properties"]["parameter"]

    except (KeyError, TypeError):
        raise HTTPException(
            status_code=502,
            detail="Unexpected NASA POWER response format."
        )

    return {
        "project": "AgroShift",
        "source": "NASA POWER",
        "coordinates": {
            "latitude": latitude,
            "longitude": longitude
        },
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "community": "AG",
        "units": nasa_data.get("parameters", {}),
        "data": climate_data
    }


@router.get("/takoradi")
async def get_takoradi_climate():

    result = await fetch_nasa_climate(
        latitude=4.90,
        longitude=-1.75,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 1, 7)
    )

    result["location"] = "Takoradi, Ghana"

    return result


@router.get("/point")
async def get_climate_for_location(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    start_date: date = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: date = Query(..., description="End date in YYYY-MM-DD format"),
):

    if end_date < start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be earlier than start date."
        )

    return await fetch_nasa_climate(
        latitude=latitude,
        longitude=longitude,
        start_date=start_date,
        end_date=end_date
    )