import httpx
from typing import Tuple


def zip_to_location(zip_code: str) -> Tuple[str, str]:
    """Convert US ZIP code to (city, state) via OpenStreetMap Nominatim."""
    params = {
        "q": f"{zip_code}, United States",
        "format": "json",
        "limit": 1,
        "addressdetails": 1,
    }
    headers = {"User-Agent": "HomePulseAI/1.0 portfolio-project"}
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(
                "https://nominatim.openstreetmap.org/search",
                params=params,
                headers=headers,
            )
            resp.raise_for_status()
        results = resp.json()
        if results:
            addr = results[0].get("address", {})
            city = (
                addr.get("city")
                or addr.get("town")
                or addr.get("village")
                or addr.get("suburb")
                or addr.get("county")
                or "Unknown"
            )
            state = addr.get("state", "Unknown")
            return city, state
    except Exception:
        pass
    return "Unknown", "Unknown"
