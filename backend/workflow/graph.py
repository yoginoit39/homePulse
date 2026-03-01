"""
LangGraph multi-agent workflow for HomePulse AI.

Pipeline: DataAgent → AnalystAgent → ReasonerAgent → CriticAgent

Each agent node returns partial state updates. Fields annotated with
operator.add (analysis, agent_events) are accumulated across nodes.
"""
from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.data_agent import data_agent
from agents.analyst_agent import analyst_agent
from agents.reasoner_agent import reasoner_agent
from agents.critic_agent import critic_agent


def build_graph(groq_api_key: str, fred_api_key: str):
    """Compile and return the LangGraph agent pipeline."""
    workflow = StateGraph(AgentState)

    workflow.add_node("data_agent",     lambda s: data_agent(s, fred_api_key))
    workflow.add_node("analyst_agent",  lambda s: analyst_agent(s, groq_api_key))
    workflow.add_node("reasoner_agent", lambda s: reasoner_agent(s, groq_api_key))
    workflow.add_node("critic_agent",   lambda s: critic_agent(s, groq_api_key))

    workflow.set_entry_point("data_agent")
    workflow.add_edge("data_agent",     "analyst_agent")
    workflow.add_edge("analyst_agent",  "reasoner_agent")
    workflow.add_edge("reasoner_agent", "critic_agent")
    workflow.add_edge("critic_agent",   END)

    return workflow.compile()
