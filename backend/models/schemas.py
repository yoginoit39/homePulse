from pydantic import BaseModel, Field
from typing import Optional, List


class AnalyzeRequest(BaseModel):
    zip_code: str = Field(..., min_length=5, max_length=5, pattern=r"^\d{5}$")


class FREDPoint(BaseModel):
    date: str
    value: float


class MarketDataResponse(BaseModel):
    zip_code: str
    city: str
    us_state: str
    mortgage_30yr_current: Optional[float]
    mortgage_15yr_current: Optional[float]
    hpi_current: Optional[float]
    hpi_yoy_change: Optional[float]
    median_price_current: Optional[float]
    inventory_current: Optional[float]
    mortgage_history: List[FREDPoint]
    hpi_history: List[FREDPoint]
    median_price_history: List[FREDPoint]
