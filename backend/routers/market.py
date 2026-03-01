import os
import asyncio
from fastapi import APIRouter, HTTPException
from services.fred_service import get_all_series, latest, yoy_change
from services.geo_service import zip_to_location

router = APIRouter()


@router.get("/market/{zip_code}")
async def get_market(zip_code: str):
    """Return current market metrics and historical series for charts."""
    if not zip_code.isdigit() or len(zip_code) != 5:
        raise HTTPException(status_code=400, detail="ZIP code must be exactly 5 digits.")

    fred_key = os.getenv("FRED_API_KEY", "")
    if not fred_key:
        raise HTTPException(status_code=500, detail="FRED_API_KEY not configured.")

    # Fetch data concurrently
    market_data, (city, us_state) = await asyncio.gather(
        asyncio.to_thread(get_all_series, fred_key),
        asyncio.to_thread(zip_to_location, zip_code),
    )

    return {
        "zip_code": zip_code,
        "city": city,
        "us_state": us_state,
        "mortgage_30yr_current": latest(market_data.get("mortgage_30yr", [])),
        "mortgage_15yr_current": latest(market_data.get("mortgage_15yr", [])),
        "hpi_current": latest(market_data.get("hpi", [])),
        "hpi_yoy_change": yoy_change(market_data.get("hpi", [])),
        "median_price_current": latest(market_data.get("median_price", [])),
        "inventory_current": latest(market_data.get("inventory", [])),
        "mortgage_history": market_data.get("mortgage_30yr", []),
        "hpi_history": market_data.get("hpi", []),
        "median_price_history": market_data.get("median_price", []),
    }
