from typing import TypedDict, Annotated, List, Dict, Any
import operator


class AgentState(TypedDict):
    zip_code: str
    city: str
    us_state: str
    market_data: Dict[str, Any]
    analysis: Annotated[List[str], operator.add]
    verdict: str
    confidence: str
    reasoning: str
    agent_events: Annotated[List[Dict], operator.add]
    error: str
