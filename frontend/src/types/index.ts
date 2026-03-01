export type Verdict = "BUY" | "HOLD" | "SELL";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type AgentStatus = "waiting" | "running" | "done" | "error";

export interface AgentCard {
  id: string;
  label: string;
  status: AgentStatus;
  summary: string;
  details: string;
}

export interface FREDPoint {
  date: string;
  value: number;
}

export interface MarketData {
  zip_code: string;
  city: string;
  us_state: string;
  mortgage_30yr_current: number | null;
  mortgage_15yr_current: number | null;
  hpi_current: number | null;
  hpi_yoy_change: number | null;
  median_price_current: number | null;
  inventory_current: number | null;
  mortgage_history: FREDPoint[];
  hpi_history: FREDPoint[];
  median_price_history: FREDPoint[];
}

export interface AnalysisResult {
  verdict: Verdict;
  confidence: Confidence;
  reasoning: string;
  critique: string;
  city: string;
  us_state: string;
}

export interface SSEEvent {
  type: "agent_start" | "agent_done" | "done" | "error";
  agent?: string;
  label?: string;
  icon?: string;
  message?: string;
  summary?: string;
  details?: string;
  verdict?: Verdict;
  confidence?: Confidence;
  reasoning?: string;
  critique?: string;
  city?: string;
  us_state?: string;
}
