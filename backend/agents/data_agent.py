from typing import Dict, Any
from services.fred_service import get_all_series, latest, yoy_change
from services.geo_service import zip_to_location


def data_agent(ctx: Dict[str, Any], fred_api_key: str) -> Dict[str, Any]:
    """Fetch FRED market data and resolve ZIP code to city/state."""
    zip_code = ctx["zip_code"]

    city, us_state = zip_to_location(zip_code)
    market_data = get_all_series(fred_api_key)

    m30 = latest(market_data.get("mortgage_30yr", []))
    hpi = latest(market_data.get("hpi", []))
    hpi_change = yoy_change(market_data.get("hpi", []))
    median = latest(market_data.get("median_price", []))
    inv = latest(market_data.get("inventory", []))

    event = {
        "agent": "data",
        "label": "Data Agent",
        "icon": "🔍",
        "summary": f"Market data loaded for {city}, {us_state}",
        "details": (
            f"30-yr mortgage: {f'{m30:.2f}%' if m30 else 'N/A'} | "
            f"HPI: {f'{hpi:.1f}' if hpi else 'N/A'} "
            f"({f'+{hpi_change:.1f}%' if hpi_change and hpi_change >= 0 else f'{hpi_change:.1f}%' if hpi_change else 'N/A'} YoY) | "
            f"Median price: ${f'{median:,.0f}' if median else 'N/A'} | "
            f"Inventory: {f'{inv:,.0f}' if inv else 'N/A'} listings"
        ),
    }

    return {
        "city": city,
        "us_state": us_state,
        "market_data": market_data,
        "agent_events": [event],
    }
