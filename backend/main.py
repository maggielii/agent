"""
CouncilOS CLoD proxy: keeps CLOD_API_KEY server-side and calls CLōD OpenAI-compatible API.
Run: source venv/bin/activate && uvicorn main:app --reload
"""

from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

CLOD_API_KEY = os.getenv("CLOD_API_KEY", "").strip()
CLOD_BASE_URL = os.getenv("CLOD_BASE_URL", "https://api.clod.io/v1").rstrip("/")
CLOD_MODEL = os.getenv("CLOD_MODEL", "DeepSeek V3")


class ExecutionPlanRequest(BaseModel):
    idea: str = Field(..., min_length=1)


class ClodExecutionPlan(BaseModel):
    implementationPhases: list[str]
    fileStructure: list[str]
    mvpScope: str
    implementationRisk: str  # "low" | "medium" | "high"
    estimatedBuildWeeks: int


SYSTEM_PROMPT = """You are an engineering planner for startup MVPs. Reply with ONLY a JSON object (no markdown fences, no commentary) with exactly these keys:
- implementationPhases: array of 3 short strings (phase descriptions with rough weeks)
- fileStructure: array of 3 strings (monorepo paths or module names)
- mvpScope: one concise sentence on what to ship first
- implementationRisk: one of "low", "medium", "high"
- estimatedBuildWeeks: integer between 4 and 24"""


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if "```" in text:
        m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if m:
            text = m.group(1).strip()
    obj = json.loads(text)
    if not isinstance(obj, dict):
        raise ValueError("expected JSON object")
    return obj


def _normalize_plan(raw: dict[str, Any]) -> ClodExecutionPlan:
    risk = str(raw.get("implementationRisk", "medium")).lower()
    if risk not in ("low", "medium", "high"):
        risk = "medium"
    phases = raw.get("implementationPhases") or []
    files = raw.get("fileStructure") or []
    if not isinstance(phases, list):
        phases = []
    if not isinstance(files, list):
        files = []
    weeks = raw.get("estimatedBuildWeeks", 8)
    try:
        weeks = int(weeks)
    except (TypeError, ValueError):
        weeks = 8
    weeks = max(4, min(24, weeks))
    return ClodExecutionPlan(
        implementationPhases=[str(x) for x in phases][:8] or ["Phase 1", "Phase 2", "Phase 3"],
        fileStructure=[str(x) for x in files][:8] or ["apps/web", "packages/core", "packages/api"],
        mvpScope=str(raw.get("mvpScope") or "Deliver core MVP slice first."),
        implementationRisk=risk,
        estimatedBuildWeeks=weeks,
    )


async def call_clod_chat(user_content: str) -> str:
    if not CLOD_API_KEY:
        raise HTTPException(status_code=503, detail="CLOD_API_KEY is not set on the server")

    url = f"{CLOD_BASE_URL}/chat/completions"
    payload = {
        "model": CLOD_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        "temperature": 0.35,
        "max_completion_tokens": 1024,
    }
    headers = {
        "Authorization": f"Bearer {CLOD_API_KEY}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        res = await client.post(url, headers=headers, json=payload)
    if res.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"CLoD API error {res.status_code}: {res.text[:500]}",
        )
    data = res.json()
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as e:
        raise HTTPException(status_code=502, detail=f"Unexpected CLoD response shape: {e}") from e


app = FastAPI(title="CouncilOS CLoD backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/clod/execution-plan", response_model=ClodExecutionPlan)
async def execution_plan(body: ExecutionPlanRequest) -> ClodExecutionPlan:
    user_prompt = (
        f'Startup idea to plan:\n"""{body.idea.strip()}"""\n'
        "Output the JSON object now."
    )
    content = await call_clod_chat(user_prompt)
    try:
        raw = _extract_json(content)
        return _normalize_plan(raw)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status_code=502,
            detail=f"Could not parse model output as JSON: {e}; snippet: {content[:400]}",
        ) from e
