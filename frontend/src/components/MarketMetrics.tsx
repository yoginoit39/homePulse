"use client";
import { MarketData } from "@/types";

interface Props {
  data: MarketData | null;
  loading: boolean;
}

interface Metric {
  label: string;
  key: keyof MarketData;
  format: (v: number) => string;
  changeKey?: keyof MarketData;
  changeInvert?: boolean; // true = down is good (e.g. mortgage rates)
}

const METRICS: Metric[] = [
  { label: "30-YR FIXED",    key: "mortgage_30yr_current",  format: v => `${v.toFixed(2)}%`, changeInvert: true },
  { label: "15-YR FIXED",    key: "mortgage_15yr_current",  format: v => `${v.toFixed(2)}%`, changeInvert: true },
  { label: "MEDIAN PRICE",   key: "median_price_current",   format: v => `$${(v / 1000).toFixed(0)}K` },
  { label: "CASE-SHILLER",   key: "hpi_current",            format: v => v.toFixed(1), changeKey: "hpi_yoy_change" },
  { label: "ACTIVE LISTINGS",key: "inventory_current",      format: v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M` : `${(v / 1000).toFixed(0)}K` },
];

export default function MarketMetrics({ data, loading }: Props) {
  const showSkeleton = loading && !data;

  return (
    <div style={s.strip} className={showSkeleton ? "" : "fade-up"}>
      {METRICS.map((m, i) => {
        const val       = data ? (data[m.key] as number | null) : null;
        const changeVal = m.changeKey && data ? (data[m.changeKey] as number | null) : null;
        const isUp      = (changeVal ?? 0) > 0;
        // for rates: up is bad; for prices/HPI: up is neutral
        const upColor   = m.changeInvert ? "var(--red)" : "var(--green)";
        const downColor = m.changeInvert ? "var(--green)" : "var(--red)";

        return (
          <div key={m.key} style={{ ...s.cell, borderLeft: i === 0 ? "none" : "1px solid var(--border-2)" }}>
            <span style={s.label}>{m.label}</span>
            {showSkeleton ? (
              <div style={s.skelVal} className="skeleton" />
            ) : val != null ? (
              <>
                <span style={s.value} className="num">{m.format(val)}</span>
                {changeVal != null && (
                  <span style={{ ...s.change, color: isUp ? upColor : downColor }}>
                    {isUp ? "↑" : "↓"}&thinsp;{Math.abs(changeVal).toFixed(1)}% YoY
                  </span>
                )}
              </>
            ) : (
              <span style={s.na}>—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  strip: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  cell: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    padding: "18px 20px",
  },
  label: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.09em",
    color: "var(--text-3)",
    textTransform: "uppercase" as const,
  },
  value: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text-1)",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  change: { fontSize: 11, fontWeight: 500 },
  na: { fontSize: 22, color: "var(--text-3)", fontWeight: 300 },
  skelVal: { height: 28, width: "70%", marginTop: 4 },
};
