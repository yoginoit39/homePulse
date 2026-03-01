"use client";
import { AnalysisResult, Verdict, Confidence } from "@/types";

interface Props {
  result: AnalysisResult;
  zip: string;
}

const V_COLOR: Record<Verdict, string> = {
  BUY:  "var(--green)",
  HOLD: "var(--amber)",
  SELL: "var(--red)",
};

const V_BORDER: Record<Verdict, string> = {
  BUY:  "var(--green-border)",
  HOLD: "var(--amber-border)",
  SELL: "var(--red-border)",
};

const V_BG: Record<Verdict, string> = {
  BUY:  "var(--green-bg)",
  HOLD: "var(--amber-bg)",
  SELL: "var(--red-bg)",
};

const V_DESC: Record<Verdict, string> = {
  BUY:  "Conditions favor buyers entering the market.",
  HOLD: "Mixed signals — monitor before committing.",
  SELL: "Market conditions favor sellers.",
};

const C_COLOR: Record<Confidence, string> = {
  HIGH:   "var(--green)",
  MEDIUM: "var(--amber)",
  LOW:    "var(--red)",
};

const C_BG: Record<Confidence, string> = {
  HIGH:   "var(--green-bg)",
  MEDIUM: "var(--amber-bg)",
  LOW:    "var(--red-bg)",
};

export default function VerdictCard({ result, zip }: Props) {
  const vc = V_COLOR[result.verdict];
  const vborder = V_BORDER[result.verdict];
  const vbg = V_BG[result.verdict];
  const cc = C_COLOR[result.confidence];
  const cbg = C_BG[result.confidence];

  const location = result.us_state && result.us_state !== "Unknown"
    ? `${result.city}, ${result.us_state}`
    : result.city || `ZIP ${zip}`;

  return (
    <div style={{ ...v.card, borderColor: vborder, borderLeftColor: vc }} className="fade-up">

      {/* Top row */}
      <div style={v.top}>
        <div style={v.topLeft}>
          <p style={v.location}>{location}</p>
          <div style={v.verdictRow}>
            <span style={{ ...v.verdict, color: vc }}>{result.verdict}</span>
            <div style={{ ...v.confBadge, color: cc, background: cbg }}>
              {result.confidence} CONFIDENCE
            </div>
          </div>
          <p style={v.desc}>{V_DESC[result.verdict]}</p>
        </div>

        {/* Big visual indicator */}
        <div style={{ ...v.indicator, background: vbg, borderColor: vborder }}>
          <span style={{ ...v.indicatorText, color: vc }}>
            {result.verdict === "BUY" ? "↑" : result.verdict === "SELL" ? "↓" : "→"}
          </span>
        </div>
      </div>

      <div style={v.divider} />

      {/* Reasoning */}
      <div style={v.section}>
        <p style={v.sectionLabel}>Reasoner analysis</p>
        <p style={v.body}>{result.reasoning}</p>
      </div>

      {result.critique && (
        <>
          <div style={v.divider} />
          <div style={v.section}>
            <p style={v.sectionLabel}>Risk assessment</p>
            <p style={{ ...v.body, color: "var(--text-2)" }}>{result.critique}</p>
          </div>
        </>
      )}

      <div style={v.footer}>
        For informational purposes only. Consult a licensed real estate professional before making investment decisions.
      </div>
    </div>
  );
}

const v: Record<string, React.CSSProperties> = {
  card: {
    background: "var(--surface)",
    border: "1px solid",
    borderLeft: "4px solid",
    borderRadius: "0 12px 12px 0",
    padding: "24px 28px",
  },
  top: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 20,
  },
  topLeft: { display: "flex", flexDirection: "column", gap: 8 },
  location: { fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "var(--text-3)", textTransform: "uppercase" as const },
  verdictRow: { display: "flex", alignItems: "center", gap: 14 },
  verdict: { fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 },
  confBadge: {
    fontSize: 10, fontWeight: 700,
    padding: "4px 10px", borderRadius: 6,
    letterSpacing: "0.07em",
  },
  desc: { fontSize: 13, color: "var(--text-2)" },

  indicator: {
    width: 72, height: 72,
    borderRadius: 16,
    border: "1px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  indicatorText: { fontSize: 34, fontWeight: 700, lineHeight: 1 },

  divider: { height: 1, background: "var(--border-2)", margin: "16px 0" },
  section: { display: "flex", flexDirection: "column", gap: 7 },
  sectionLabel: { fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", color: "var(--text-3)", textTransform: "uppercase" as const },
  body: { fontSize: 14, color: "var(--text-1)", lineHeight: 1.7 },
  footer: {
    marginTop: 20,
    paddingTop: 14,
    borderTop: "1px solid var(--border-2)",
    fontSize: 11,
    color: "var(--text-3)",
    lineHeight: 1.6,
  },
};
