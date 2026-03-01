from typing import Dict, Any
from groq import Groq


def critic_agent(ctx: Dict[str, Any], groq_api_key: str) -> Dict[str, Any]:
    """Validate the recommendation and surface key risks."""
    verdict = ctx.get("verdict", "HOLD")
    confidence = ctx.get("confidence", "MEDIUM")
    reasoning = ctx.get("reasoning", "")
    city = ctx.get("city", "the area")
    us_state = ctx.get("us_state", "")
    location = f"{city}, {us_state}" if us_state and us_state != "Unknown" else city

    prompt = f"""You are a senior real estate risk analyst. Review this investment recommendation for {location} and provide a balanced critique.

Recommendation: {verdict} (Confidence: {confidence})
Reasoning: {reasoning}

Your task:
1. Identify 2-3 specific risks or counterpoints not mentioned in the reasoning
2. Note important caveats (local market variation, macro risks, personal finance factors)
3. If confidence seems misaligned with the data, say so briefly

Write 2-3 concise sentences. Be balanced — don't dismiss the recommendation, but ensure the reader has a complete picture. Use professional analyst language."""

    client = Groq(api_key=groq_api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=220,
    )
    critique = response.choices[0].message.content.strip()

    event = {
        "agent": "critic",
        "label": "Critic Agent",
        "icon": "⚖️",
        "summary": "Risk assessment and validation complete",
        "details": critique,
    }

    return {
        "analysis": [critique],
        "agent_events": [event],
    }
