"use client";
import dynamic from "next/dynamic";
import { MarketData } from "@/types";

// Recharts uses browser APIs — must be loaded client-side only
const ChartsImpl = dynamic(() => import("./ChartsImpl"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, height: 230, animation: "pulse 1.5s ease infinite" }} />
      ))}
    </div>
  ),
});

interface Props {
  data: MarketData | null;
}

export default function ChartsSection({ data }: Props) {
  if (!data) return null;

  return (
    <ChartsImpl
      mortgageHistory={data.mortgage_history}
      hpiHistory={data.hpi_history}
      medianPriceHistory={data.median_price_history}
    />
  );
}
