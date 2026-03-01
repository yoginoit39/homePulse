import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import market, analyze

load_dotenv()

app = FastAPI(
    title="HomePulse AI",
    description="AI-powered real estate market intelligence via LangGraph multi-agent pipeline",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market.router)
app.include_router(analyze.router)


@app.get("/")
def root():
    return {"message": "HomePulse AI API", "status": "ok"}
