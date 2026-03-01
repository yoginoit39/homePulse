"use client";
import { useState, FormEvent } from "react";

interface Props {
  onSubmit: (zipCode: string) => void;
  loading: boolean;
}

export default function SearchForm({ onSubmit, loading }: Props) {
  const [zip, setZip] = useState("");
  const valid = zip.length === 5;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid || loading) return;
    onSubmit(zip);
  }

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      <div style={s.row}>
        <input
          style={{ ...s.input, ...(loading ? s.inputDisabled : {}) }}
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="ZIP code — e.g. 10001"
          value={zip}
          onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          style={{ ...s.btn, ...(!valid || loading ? s.btnDisabled : {}) }}
          type="submit"
          disabled={!valid || loading}
        >
          {loading
            ? <span style={s.btnInner}><span className="spinner" /><span>Analyzing</span></span>
            : "Analyze →"
          }
        </button>
      </div>
      <style>{`
        form input::placeholder { color: var(--text-3); }
        form input:focus {
          outline: none;
          border-color: var(--blue) !important;
          box-shadow: 0 0 0 3px rgba(59,126,255,0.15);
        }
      `}</style>
    </form>
  );
}

const s: Record<string, React.CSSProperties> = {
  form: { width: "100%" },
  row: { display: "flex", gap: 8 },
  input: {
    flex: 1,
    padding: "11px 16px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 9,
    color: "var(--text-1)",
    fontSize: 15,
    letterSpacing: "0.06em",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputDisabled: { opacity: 0.45, cursor: "not-allowed" },
  btn: {
    padding: "11px 22px",
    background: "var(--blue)",
    border: "none",
    borderRadius: 9,
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap" as const,
    transition: "opacity 0.15s",
    letterSpacing: "0.01em",
  },
  btnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  btnInner: { display: "flex", alignItems: "center", gap: 8 },
};
