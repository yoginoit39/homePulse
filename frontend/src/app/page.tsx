"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SearchForm from "@/components/SearchForm";
import MarketMetrics from "@/components/MarketMetrics";
import AgentPipeline from "@/components/AgentPipeline";
import VerdictCard from "@/components/VerdictCard";
import { MarketData, AgentCard, AnalysisResult, SSEEvent } from "@/types";

const ChartsSection = dynamic(() => import("@/components/ChartsSection"), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

const INITIAL_AGENTS: AgentCard[] = [
  { id: "data",     label: "Data",      status: "waiting", summary: "", details: "" },
  { id: "analyst",  label: "Analyst",   status: "waiting", summary: "", details: "" },
  { id: "reasoner", label: "Reasoner",  status: "waiting", summary: "", details: "" },
  { id: "critic",   label: "Critic",    status: "waiting", summary: "", details: "" },
];

const EXAMPLE_ZIPS = ["10001", "90210", "60601", "77001", "33101"];

export default function HomePage() {
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [marketData,  setMarketData]    = useState<MarketData | null>(null);
  const [agents,      setAgents]        = useState<AgentCard[]>(INITIAL_AGENTS);
  const [verdict,     setVerdict]       = useState<AnalysisResult | null>(null);
  const [error,       setError]         = useState("");
  const [hasResults,  setHasResults]    = useState(false);
  const [loadingMkt,  setLoadingMkt]    = useState(false);
  const [activeZip,   setActiveZip]     = useState("");

  const updateAgent = useCallback((id: string, patch: Partial<AgentCard>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }, []);

  async function handleAnalyze(zip: string) {
    setActiveZip(zip);
    setIsAnalyzing(true);
    setLoadingMkt(true);
    setError("");
    setVerdict(null);
    setHasResults(true);
    setMarketData(null);
    setAgents(INITIAL_AGENTS.map(a => ({ ...a, status: "waiting" })));

    fetch(`${API}/market/${zip}`)
      .then(r => r.json())
      .then(d => { setMarketData(d); setLoadingMkt(false); })
      .catch(() => setLoadingMkt(false));

    try {
      const resp = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip_code: zip }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        setError((err as { detail?: string }).detail || "Analysis failed.");
        setIsAnalyzing(false);
        return;
      }

      const reader  = resp.body!.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let ev: SSEEvent;
          try { ev = JSON.parse(line.slice(6)); } catch { continue; }

          if (ev.type === "agent_start" && ev.agent) {
            updateAgent(ev.agent, { status: "running" });
          } else if (ev.type === "agent_done" && ev.agent) {
            updateAgent(ev.agent, { status: "done", summary: ev.summary ?? "", details: ev.details ?? "" });
          } else if (ev.type === "done") {
            setVerdict({ verdict: ev.verdict!, confidence: ev.confidence!, reasoning: ev.reasoning ?? "", critique: ev.critique ?? "", city: ev.city ?? "", us_state: ev.us_state ?? "" });
          } else if (ev.type === "error") {
            setError(ev.message ?? "An error occurred.");
          }
        }
      }
    } catch {
      setError("Could not reach the server. Make sure the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleReset() {
    setHasResults(false);
    setMarketData(null);
    setVerdict(null);
    setError("");
    setActiveZip("");
    setAgents(INITIAL_AGENTS.map(a => ({ ...a, status: "waiting" })));
  }

  const location = marketData
    ? `${marketData.city}, ${marketData.us_state}`
    : activeZip ? `ZIP ${activeZip}` : "";

  return (
    <div style={s.root}>
      {/* ── Header ───────────────────────────────────────────── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden>
              <path d="M9 1L1 7v8h4v-4h8v4h4V7L9 1z" fill="var(--blue)" />
            </svg>
            <span style={s.logoText}>HomePulse</span>
          </div>
          <div style={s.headerMeta}>
            <span style={s.dot} />
            <span style={s.metaText}>FRED · LangGraph · Groq LLaMA 3.3</span>
          </div>
        </div>
      </header>

      {/* ── Landing ──────────────────────────────────────────── */}
      {!hasResults && (
        <main style={s.landing}>
          <div style={s.landingGrid}>
            {/* Left: copy */}
            <div style={s.landingCopy}>
              <p style={s.eyebrow}>US HOUSING MARKET ANALYSIS</p>
              <h1 style={s.headline}>Real estate intel,<br />without the noise.</h1>
              <p style={s.subline}>
                Enter any US ZIP code to get live mortgage rates, home price trends,
                and a data-backed market assessment from a 4-agent AI pipeline.
              </p>
              <div style={s.featureList}>
                {[
                  ["Live economic data", "Sourced from the St. Louis Fed (FRED)"],
                  ["4-agent AI pipeline", "Data → Analyst → Reasoner → Critic"],
                  ["Clear verdict", "BUY, HOLD, or SELL with reasoning"],
                ].map(([title, desc]) => (
                  <div key={title} style={s.featureRow}>
                    <span style={s.featureDot} />
                    <div>
                      <span style={s.featureTitle}>{title}</span>
                      <span style={s.featureDesc}> — {desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <div style={s.landingForm}>
              <p style={s.formLabel}>Enter a ZIP code to get started</p>
              <SearchForm onSubmit={handleAnalyze} loading={isAnalyzing} />
              <div style={s.exampleRow}>
                <span style={s.exLabel}>Try:</span>
                {EXAMPLE_ZIPS.map(z => (
                  <button key={z} style={s.exBtn} onClick={() => handleAnalyze(z)}>{z}</button>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── Results ──────────────────────────────────────────── */}
      {hasResults && (
        <main style={s.results}>

          {/* Location bar */}
          <div style={s.locBar}>
            <div style={s.locLeft}>
              <button style={s.backBtn} onClick={handleReset}>← New search</button>
              <div style={s.locDivider} />
              <h2 style={s.locTitle}>{location || `ZIP ${activeZip}`}</h2>
              {isAnalyzing && (
                <div style={s.analyzingBadge}>
                  <span className="spinner" />
                  <span>Analyzing</span>
                </div>
              )}
              {!isAnalyzing && verdict && (
                <span style={{ ...s.doneBadge, color: verdict.verdict === "BUY" ? "var(--green)" : verdict.verdict === "SELL" ? "var(--red)" : "var(--amber)" }}>
                  ● {verdict.verdict}
                </span>
              )}
            </div>
            <span style={s.zipPill}>ZIP {activeZip}</span>
          </div>

          {/* Error */}
          {error && (
            <div style={s.errorBox} className="fade-in">
              <span style={s.errorIcon}>!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Metrics */}
          <MarketMetrics data={marketData} loading={loadingMkt} />

          {/* Charts */}
          <ChartsSection data={marketData} />

          {/* Divider */}
          <div style={s.sectionDivider}>
            <span style={s.sectionLabel}>AI Analysis Pipeline</span>
          </div>

          {/* Agents */}
          <AgentPipeline agents={agents} isAnalyzing={isAnalyzing} />

          {/* Verdict */}
          {verdict && (
            <>
              <div style={s.sectionDivider}>
                <span style={s.sectionLabel}>Market Assessment</span>
              </div>
              <VerdictCard result={verdict} zip={activeZip} />
            </>
          )}
        </main>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", background: "var(--bg)" },

  /* Header */
  header: { borderBottom: "1px solid var(--border-2)", position: "sticky", top: 0, background: "rgba(7,9,14,0.92)", backdropFilter: "blur(12px)", zIndex: 50 },
  headerInner: { maxWidth: 1100, margin: "0 auto", padding: "0 32px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 9 },
  logoText: { fontSize: 15, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em" },
  headerMeta: { display: "flex", alignItems: "center", gap: 7 },
  dot: { width: 6, height: 6, borderRadius: "50%", background: "var(--green)", flexShrink: 0, animation: "blink 2.5s ease infinite" },
  metaText: { fontSize: 11, color: "var(--text-3)", letterSpacing: "0.04em" },

  /* Landing */
  landing: { maxWidth: 1100, margin: "0 auto", padding: "72px 32px 80px" },
  landingGrid: { display: "grid", gridTemplateColumns: "1fr 420px", gap: 80, alignItems: "start" },
  landingCopy: { display: "flex", flexDirection: "column", gap: 24 },
  eyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "var(--text-3)", textTransform: "uppercase" as const },
  headline: { fontSize: 52, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", color: "var(--text-1)" },
  subline: { fontSize: 16, color: "var(--text-2)", lineHeight: 1.65, maxWidth: 460 },
  featureList: { display: "flex", flexDirection: "column", gap: 12, marginTop: 4 },
  featureRow: { display: "flex", alignItems: "flex-start", gap: 12 },
  featureDot: { width: 5, height: 5, borderRadius: "50%", background: "var(--blue)", flexShrink: 0, marginTop: 7 },
  featureTitle: { fontSize: 13, fontWeight: 600, color: "var(--text-1)" },
  featureDesc: { fontSize: 13, color: "var(--text-2)" },

  landingForm: { display: "flex", flexDirection: "column", gap: 16, paddingTop: 12 },
  formLabel: { fontSize: 12, color: "var(--text-3)", letterSpacing: "0.02em" },
  exampleRow: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const },
  exLabel: { fontSize: 11, color: "var(--text-3)" },
  exBtn: {
    padding: "3px 10px", background: "transparent",
    border: "1px solid var(--border)", borderRadius: 6,
    color: "var(--text-2)", fontSize: 12, cursor: "pointer",
    fontFamily: "inherit", transition: "border-color 0.15s, color 0.15s",
  },

  /* Results */
  results: { maxWidth: 1100, margin: "0 auto", padding: "28px 32px 80px" },

  /* Location bar */
  locBar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--border-2)" },
  locLeft: { display: "flex", alignItems: "center", gap: 14 },
  backBtn: { background: "none", border: "none", color: "var(--text-2)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 0, transition: "color 0.15s" },
  locDivider: { width: 1, height: 16, background: "var(--border)" },
  locTitle: { fontSize: 22, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" },
  analyzingBadge: { display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-2)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "4px 12px" },
  doneBadge: { fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" },
  zipPill: { fontSize: 11, color: "var(--text-3)", background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 6, padding: "4px 10px", letterSpacing: "0.04em" },

  /* Error */
  errorBox: { display: "flex", alignItems: "center", gap: 12, background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 13, marginBottom: 24 },
  errorIcon: { width: 20, height: 20, borderRadius: "50%", background: "var(--red)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 },

  /* Section dividers */
  sectionDivider: { display: "flex", alignItems: "center", gap: 14, margin: "36px 0 24px", },
  sectionLabel: { fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "var(--text-3)", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const },
};
