from typing import Dict, Any
from groq import Groq
from services.fred_service import latest, yoy_change


def analyst_agent(ctx: Dict[str, Any], groq_api_key: str) -> Dict[str, Any]:
    """Analyze housing market trends using Groq LLM."""
    market_data = ctx["market_data"]
    city = ctx.get("city", "the United States")
    us_state = ctx.get("us_state", "")

    m30 = latest(market_data.get("mortgage_30yr", []))
    m15 = latest(market_data.get("mortgage_15yr", []))
    hpi = latest(market_data.get("hpi", []))
    hpi_change = yoy_change(market_data.get("hpi", []))
    median = latest(market_data.get("median_price", []))
    inv = latest(market_data.get("inventory", []))

    location = f"{city}, {us_state}" if us_state and us_state != "Unknown" else city

    prompt = f"""You are a senior real estate market analyst. Analyze the following U.S. housing market data relevant to {location}:

Current Market Indicators:
- 30-Year Fixed Mortgage Rate: {f'{m30:.2f}%' if m30 else 'unavailable'}
- 15-Year Fixed Mortgage Rate: {f'{m15:.2f}%' if m15 else 'unavailable'}
- Case-Shiller National Home Price Index: {f'{hpi:.1f}' if hpi else 'unavailable'}
- HPI Year-over-Year Change: {f'{hpi_change:+.1f}%' if hpi_change is not None else 'unavailable'}
- National Median Home Sale Price: {f'${median:,.0f}' if median else 'unavailable'}
- Housing Inventory (Active Listings): {f'{inv:,.0f} units' if inv else 'unavailable'}

Write a concise 3-4 sentence professional analysis covering:
1. Current interest rate environment and buyer affordability pressure
2. Home price trajectory — is the market heating up, cooling, or stabilizing?
3. Supply-demand balance based on inventory levels

Be specific with the numbers provided. Write as a senior analyst for an institutional audience."""

    client = Groq(api_key=groq_api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.35,
        max_tokens=350,
    )
    analysis_text = response.choices[0].message.content.strip()

    event = {
        "agent": "analyst",
        "label": "Analyst Agent",
        "icon": "📊",
        "summary": "Market trend analysis complete",
        "details": analysis_text,
    }

    return {
        "analysis": [analysis_text],
        "agent_events": [event],
    }
