import os
import json
import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import AnalyzeRequest
from agents.data_agent import data_agent
from agents.analyst_agent import analyst_agent
from agents.reasoner_agent import reasoner_agent
from agents.critic_agent import critic_agent

router = APIRouter()


@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    """Stream agent events as SSE while running the LangGraph pipeline."""
    groq_key = os.getenv("GROQ_API_KEY", "")
    fred_key = os.getenv("FRED_API_KEY", "")

    if not groq_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured.")
    if not fred_key:
        raise HTTPException(status_code=500, detail="FRED_API_KEY not configured.")

    async def event_stream():
        def sse(payload: dict) -> str:
            return f"data: {json.dumps(payload)}\n\n"

        # Mutable context dict mirrors AgentState (no LangGraph runtime overhead)
        ctx: dict = {
            "zip_code": req.zip_code,
            "city": "",
            "us_state": "",
            "market_data": {},
            "analysis": [],
            "verdict": "HOLD",
            "confidence": "LOW",
            "reasoning": "",
            "agent_events": [],
            "error": "",
        }

        try:
            # ── 1. Data Agent ─────────────────────────────────────────────
            yield sse({
                "type": "agent_start",
                "agent": "data",
                "label": "Data Agent",
                "icon": "🔍",
                "message": f"Fetching market data for ZIP {req.zip_code}…",
            })
            updates = await asyncio.to_thread(data_agent, ctx, fred_key)
            ctx.update({k: v for k, v in updates.items() if k != "agent_events"})
            ae = updates["agent_events"][0]
            yield sse({"type": "agent_done", **ae})

            # ── 2. Analyst Agent ──────────────────────────────────────────
            yield sse({
                "type": "agent_start",
                "agent": "analyst",
                "label": "Analyst Agent",
                "icon": "📊",
                "message": "Analyzing mortgage rates and price trends…",
            })
            updates = await asyncio.to_thread(analyst_agent, ctx, groq_key)
            ctx["analysis"].extend(updates.get("analysis", []))
            ae = updates["agent_events"][0]
            yield sse({"type": "agent_done", **ae})

            # ── 3. Reasoner Agent ─────────────────────────────────────────
            yield sse({
                "type": "agent_start",
                "agent": "reasoner",
                "label": "Reasoner Agent",
                "icon": "🧠",
                "message": "Generating investment recommendation…",
            })
            updates = await asyncio.to_thread(reasoner_agent, ctx, groq_key)
            ctx["verdict"] = updates.get("verdict", "HOLD")
            ctx["confidence"] = updates.get("confidence", "LOW")
            ctx["reasoning"] = updates.get("reasoning", "")
            ae = updates["agent_events"][0]
            yield sse({"type": "agent_done", **ae})

            # ── 4. Critic Agent ───────────────────────────────────────────
            yield sse({
                "type": "agent_start",
                "agent": "critic",
                "label": "Critic Agent",
                "icon": "⚖️",
                "message": "Assessing risks and validating recommendation…",
            })
            updates = await asyncio.to_thread(critic_agent, ctx, groq_key)
            ctx["analysis"].extend(updates.get("analysis", []))
            ae = updates["agent_events"][0]
            yield sse({"type": "agent_done", **ae})

            # ── Done ──────────────────────────────────────────────────────
            critique = ctx["analysis"][-1] if ctx["analysis"] else ""
            yield sse({
                "type": "done",
                "verdict": ctx["verdict"],
                "confidence": ctx["confidence"],
                "reasoning": ctx["reasoning"],
                "critique": critique,
                "city": ctx["city"],
                "us_state": ctx["us_state"],
            })

        except Exception as exc:
            yield sse({"type": "error", "message": str(exc)})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # required for Render.com nginx proxy
        },
    )
