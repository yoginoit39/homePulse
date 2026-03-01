"use client";
import { AgentCard, AgentStatus } from "@/types";

interface Props {
  agents: AgentCard[];
  isAnalyzing: boolean;
}

const STEP_LABELS: Record<string, string> = {
  data:     "Fetch market data",
  analyst:  "Analyze trends",
  reasoner: "Generate verdict",
  critic:   "Validate & review",
};

const STEP_NUMS: Record<string, string> = {
  data: "01", analyst: "02", reasoner: "03", critic: "04",
};

function stepColor(status: AgentStatus): string {
  if (status === "done")    return "var(--green)";
  if (status === "running") return "var(--blue)";
  if (status === "error")   return "var(--red)";
  return "var(--text-3)";
}

function StepBar({ agents }: { agents: AgentCard[] }) {
  return (
    <div style={sb.bar}>
      {agents.map((a, i) => {
        const active  = a.status === "running";
        const done    = a.status === "done";
        const color   = stepColor(a.status);

        return (
          <div key={a.id} style={sb.step}>
            {/* connector line before (except first) */}
            {i > 0 && <div style={{ ...sb.line, background: done || active ? "var(--border)" : "var(--border-2)" }} />}

            <div style={{ ...sb.circle, borderColor: color, background: done ? color : "transparent" }}>
              {active && <span style={sb.ping} />}
              {done
                ? <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <span style={{ ...sb.num, color }}>{STEP_NUMS[a.id]}</span>
              }
            </div>

            <div style={sb.stepInfo}>
              <span style={{ ...sb.stepName, color: done || active ? "var(--text-1)" : "var(--text-3)" }}>{a.label}</span>
              <span style={{ ...sb.stepSub, color }}>{
                done ? "Done" : active ? "Running…" : "Waiting"
              }</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AgentPipeline({ agents, isAnalyzing }: Props) {
  const doneAgents = agents.filter(a => a.status === "done");

  return (
    <div style={p.wrap}>
      {/* Step progress bar */}
      <StepBar agents={agents} />

      {/* Output cards — appear as each agent finishes */}
      {doneAgents.length > 0 && (
        <div style={p.outputs}>
          {doneAgents.map((a, i) => (
            <div key={a.id} style={p.outputCard} className="fade-up" data-delay={i}>
              <div style={p.outputHead}>
                <div style={p.outputLeft}>
                  <span style={p.checkIcon}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.8 7L9 1" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span style={p.outputLabel}>{a.label} Agent</span>
                  <span style={p.outputSublabel}>{STEP_LABELS[a.id]}</span>
                </div>
                <span style={p.outputStep}>{STEP_NUMS[a.id]}</span>
              </div>

              {a.summary && (
                <p style={p.summary}>{a.summary}</p>
              )}
              {a.details && a.details !== a.summary && (
                <p style={p.details}>{a.details}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes ping {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(2.4); opacity: 0;   }
        }
      `}</style>
    </div>
  );
}

/* Step bar styles */
const sb: Record<string, React.CSSProperties> = {
  bar: {
    display: "flex",
    alignItems: "center",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "16px 24px",
    marginBottom: 16,
    gap: 0,
  },
  step: { display: "flex", alignItems: "center", gap: 10, flex: 1 },
  line: { height: 1, flex: 1, maxWidth: 40, marginRight: 10 },
  circle: {
    width: 26, height: 26,
    borderRadius: "50%",
    border: "1.5px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    position: "relative" as const,
  },
  ping: {
    position: "absolute" as const,
    inset: -4,
    borderRadius: "50%",
    background: "var(--blue)",
    opacity: 0,
    animation: "ping 1.2s ease-out infinite",
  },
  num: { fontSize: 9, fontWeight: 700, letterSpacing: "0.04em" },
  stepInfo: { display: "flex", flexDirection: "column", gap: 1 },
  stepName: { fontSize: 12, fontWeight: 600, letterSpacing: "-0.01em" },
  stepSub: { fontSize: 10, fontWeight: 500 },
};

/* Output card styles */
const p: Record<string, React.CSSProperties> = {
  wrap: { marginBottom: 8 },
  outputs: { display: "flex", flexDirection: "column", gap: 8 },
  outputCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderLeft: "3px solid var(--green)",
    borderRadius: "0 10px 10px 0",
    padding: "14px 18px",
  },
  outputHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  outputLeft: { display: "flex", alignItems: "center", gap: 10 },
  checkIcon: { width: 20, height: 20, borderRadius: "50%", background: "var(--green-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  outputLabel: { fontSize: 13, fontWeight: 600, color: "var(--text-1)" },
  outputSublabel: { fontSize: 11, color: "var(--text-3)" },
  outputStep: { fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.06em" },
  summary: { fontSize: 13, fontWeight: 600, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 4 },
  details: { fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 },
};
