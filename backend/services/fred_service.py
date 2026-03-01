import httpx
from typing import List, Dict, Optional

FRED_BASE = "https://api.stlouisfed.org/fred"

SERIES = {
    "mortgage_30yr": "MORTGAGE30US",
    "mortgage_15yr": "MORTGAGE15US",
    "hpi": "CSUSHPINSA",
    "median_price": "MSPUS",
    "inventory": "HOSINVUSM495N",
}


def fetch_series(series_id: str, api_key: str, limit: int = 52) -> List[Dict]:
    """Fetch recent observations for a FRED series, sorted oldest-first."""
    params = {
        "series_id": series_id,
        "api_key": api_key,
        "file_type": "json",
        "sort_order": "desc",
        "limit": limit,
    }
    with httpx.Client(timeout=20) as client:
        resp = client.get(f"{FRED_BASE}/series/observations", params=params)
        resp.raise_for_status()

    points = []
    for obs in resp.json().get("observations", []):
        try:
            val = float(obs["value"])
            points.append({"date": obs["date"], "value": round(val, 4)})
        except (ValueError, KeyError):
            continue

    return list(reversed(points))


def get_all_series(api_key: str) -> Dict[str, List[Dict]]:
    """Fetch all market series. Returns empty list for any series that fails."""
    result: Dict[str, List[Dict]] = {}
    for key, sid in SERIES.items():
        try:
            # mortgage data is weekly (52 = ~1 year), others monthly (24 = 2 years)
            limit = 52 if "MORTGAGE" in sid else 24
            result[key] = fetch_series(sid, api_key, limit=limit)
        except Exception:
            result[key] = []
    return result


def latest(series: List[Dict]) -> Optional[float]:
    return series[-1]["value"] if series else None


def yoy_change(series: List[Dict]) -> Optional[float]:
    """Year-over-year percent change."""
    if len(series) < 13:
        return None
    old = series[-13]["value"]
    new = series[-1]["value"]
    if old == 0:
        return None
    return round(((new / old) - 1) * 100, 2)
