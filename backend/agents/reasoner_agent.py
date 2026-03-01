import json
from typing import Dict, Any
from groq import Groq
from services.fred_service import latest


def reasoner_agent(ctx: Dict[str, Any], groq_api_key: str) -> Dict[str, Any]:
    """Generate a BUY / HOLD / SELL recommendation from market analysis."""
    market_data = ctx["market_data"]
    city = ctx.get("city", "the area")
    us_state = ctx.get("us_state", "")
    analysis = ctx.get("analysis", [])

    m30 = latest(market_data.get("mortgage_30yr", []))
    median = latest(market_data.get("median_price", []))
    location = f"{city}, {us_state}" if us_state and us_state != "Unknown" else city

    prompt = f"""You are a real estate investment strategist. Based on the market analysis below, generate a structured investment recommendation for {location}.

Market Analysis:
{analysis[-1] if analysis else 'No analysis provided.'}

Additional context:
- 30-Year Mortgage Rate: {f'{m30:.2f}%' if m30 else 'N/A'}
- National Median Home Price: {f'${median:,.0f}' if median else 'N/A'}

Provide your recommendation in JSON format with these exact fields:
{{
  "verdict": "BUY" | "HOLD" | "SELL",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "reasoning": "2-3 sentences explaining the recommendation with specific data points"
}}

Rules:
- BUY: favorable conditions for buyers (falling rates, stabilizing prices, high inventory)
- HOLD: mixed signals or transitional market
- SELL: seller's market or overheated conditions unfavorable for buyers
- Be decisive — avoid hedging the verdict"""

    client = Groq(api_key=groq_api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=300,
        response_format={"type": "json_object"},
    )

    verdict = "HOLD"
    confidence = "MEDIUM"
    reasoning = "Unable to generate recommendation."

    try:
        result = json.loads(response.choices[0].message.content)
        verdict = result.get("verdict", "HOLD").upper()
        confidence = result.get("confidence", "MEDIUM").upper()
        reasoning = result.get("reasoning", reasoning)
        if verdict not in ("BUY", "HOLD", "SELL"):
            verdict = "HOLD"
        if confidence not in ("HIGH", "MEDIUM", "LOW"):
            confidence = "MEDIUM"
    except (json.JSONDecodeError, KeyError, AttributeError):
        pass

    event = {
        "agent": "reasoner",
        "label": "Reasoner Agent",
        "icon": "🧠",
        "summary": f"Verdict: {verdict} — Confidence: {confidence}",
        "details": reasoning,
    }

    return {
        "verdict": verdict,
        "confidence": confidence,
        "reasoning": reasoning,
        "agent_events": [event],
    }
