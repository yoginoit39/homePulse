# HomePulse AI

AI-powered real estate market intelligence. Enter any US ZIP code and get live market data, historical price trends, and an AI-driven investment recommendation — streamed in real time.

**Live demo:** [home-pulse-c5gou1vt8-yoginoit39s-projects.vercel.app](https://home-pulse-c5gou1vt8-yoginoit39s-projects.vercel.app)

---

## What It Does

1. Enter a ZIP code
2. Live market metrics are fetched (mortgage rates, home prices, inventory) from the Federal Reserve (FRED API)
3. A 4-agent AI pipeline runs sequentially — Data → Analyst → Reasoner → Critic — streaming progress to the UI
4. You get a **BUY / HOLD / SELL** verdict with confidence score, reasoning, and risk assessment

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS, Recharts |
| Backend | FastAPI, Python 3.11, uvicorn |
| AI / Agents | LangGraph, Groq API (LLaMA 3.3-70B) |
| Data | FRED API (Federal Reserve), OpenStreetMap Nominatim |
| Streaming | Server-Sent Events (SSE) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Agent Pipeline

```
🔍 Data Agent   →   📊 Analyst Agent   →   🧠 Reasoner Agent   →   ⚖️ Critic Agent
  Fetch FRED           Analyze trends         BUY/HOLD/SELL          Validate &
  + geocode ZIP        with Groq LLM          verdict + confidence    surface risks
```

---

## Project Structure

```
homepulse-ai/
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── requirements.txt
│   ├── agents/
│   │   ├── data_agent.py       # FRED data + ZIP geocoding
│   │   ├── analyst_agent.py    # LLM trend analysis
│   │   ├── reasoner_agent.py   # Verdict generation
│   │   └── critic_agent.py     # Risk assessment
│   ├── routers/
│   │   ├── market.py           # GET /market/{zip_code}
│   │   └── analyze.py          # POST /analyze (SSE streaming)
│   ├── services/
│   │   ├── fred_service.py     # FRED API client
│   │   └── geo_service.py      # ZIP → city/state lookup
│   ├── models/
│   │   └── schemas.py          # Pydantic models
│   └── workflow/
│       └── graph.py            # LangGraph workflow
│
├── frontend/
│   └── src/
│       ├── app/
│       │   └── page.tsx        # Main page
│       └── components/
│           ├── SearchForm.tsx
│           ├── MarketMetrics.tsx
│           ├── AgentPipeline.tsx
│           ├── VerdictCard.tsx
│           └── ChartsSection.tsx
│
└── render.yaml                 # Render deployment config
```

---

## Local Development

### Prerequisites
- Python 3.11
- Node.js 18+
- [Groq API key](https://console.groq.com)
- [FRED API key](https://fred.stlouisfed.org/docs/api/api_key.html)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
FRED_API_KEY=your_fred_api_key
```

```bash
uvicorn main:app --reload --port 8002
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8002
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/market/{zip_code}` | Returns current metrics + 2yr historical data |
| `POST` | `/analyze` | Streams 4-agent pipeline via SSE, returns verdict |

---

## Deployment

### Backend (Render)
- Runtime: Python 3.11
- Build command: `pip install -r backend/requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Root directory: `backend`
- Environment variables: `GROQ_API_KEY`, `FRED_API_KEY`

### Frontend (Vercel)
- Framework: Next.js
- Environment variable: `NEXT_PUBLIC_API_URL` → your Render backend URL
