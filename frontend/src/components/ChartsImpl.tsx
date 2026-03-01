"use client";
import {
  AreaChart, Area,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { FREDPoint } from "@/types";

interface ChartProps {
  data: FREDPoint[];
  color: string;
  fillColor: string;
  label: string;
  format: (v: number) => string;
  type?: "area" | "line";
}

function Chart({ data, color, fillColor, label, format, type = "area" }: ChartProps) {
  const subset = data.slice(-24);
  if (subset.length === 0) return (
    <div style={cs.card}>
      <p style={cs.title}>{label}</p>
      <div style={cs.empty}>No data available</div>
    </div>
  );

  const latest = subset[subset.length - 1]?.value;

  return (
    <div style={cs.card}>
      <div style={cs.cardHead}>
        <p style={cs.title}>{label}</p>
        {latest != null && <span style={{ ...cs.currentVal, color }} className="num">{format(latest)}</span>}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        {type === "area" ? (
          <AreaChart data={subset} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id={`fill-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={fillColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border-2)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "var(--text-3)", fontSize: 9 }} tickFormatter={d => d.slice(2, 7)} interval="preserveStartEnd" axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-3)", fontSize: 9 }} tickFormatter={v => format(v)} domain={["auto", "auto"]} width={44} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-1)" }}
              labelStyle={{ color: "var(--text-2)", marginBottom: 4 }}
              itemStyle={{ color }}
              formatter={(v: number) => [format(v), label]}
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            />
            <ReferenceLine y={latest} stroke={color} strokeDasharray="3 3" strokeOpacity={0.4} strokeWidth={1} />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#fill-${label})`} dot={false} activeDot={{ r: 3, strokeWidth: 0, fill: color }} />
          </AreaChart>
        ) : (
          <LineChart data={subset} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border-2)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "var(--text-3)", fontSize: 9 }} tickFormatter={d => d.slice(2, 7)} interval="preserveStartEnd" axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-3)", fontSize: 9 }} tickFormatter={v => format(v)} domain={["auto", "auto"]} width={44} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-1)" }}
              labelStyle={{ color: "var(--text-2)", marginBottom: 4 }}
              itemStyle={{ color }}
              formatter={(v: number) => [format(v), label]}
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

interface Props {
  mortgageHistory: FREDPoint[];
  hpiHistory: FREDPoint[];
  medianPriceHistory: FREDPoint[];
}

export default function ChartsImpl({ mortgageHistory, hpiHistory, medianPriceHistory }: Props) {
  return (
    <div style={cs.grid}>
      <Chart data={mortgageHistory}    color="#3b7eff" fillColor="#3b7eff" label="30-Yr Mortgage Rate"    format={v => `${v.toFixed(2)}%`} />
      <Chart data={hpiHistory}         color="#10b981" fillColor="#10b981" label="Case-Shiller HPI"       format={v => v.toFixed(1)} />
      <Chart data={medianPriceHistory} color="#f59e0b" fillColor="#f59e0b" label="Median Sale Price"      format={v => `$${Math.round(v / 1000)}K`} />
    </div>
  );
}

const cs: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginBottom: 20,
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "16px 16px 12px",
  },
  cardHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 },
  title: { fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", color: "var(--text-3)", textTransform: "uppercase" as const },
  currentVal: { fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" },
  empty: { height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 12 },
};
