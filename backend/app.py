from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.agents.security import security_review
from backend.agents.performance import performance_review
from backend.agents.quality import quality_review
from backend.agents.testing import testing_review
from backend.agents.verdict import final_verdict

app = FastAPI(title="AI Code Review API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeRequest(BaseModel):
    code: str


@app.get("/")
def home():
    return {"message": "Backend Running"}


@app.post("/review")
def review(data: CodeRequest):
    if not data.code.strip():
        raise HTTPException(status_code=422, detail="Code cannot be empty.")

    try:
        security_result = security_review(data.code)
    except Exception as e:
        security_result = _error_result("Security Auditor", str(e))

    try:
        performance_result = performance_review(data.code)
    except Exception as e:
        performance_result = _error_result("Performance Analyzer", str(e))

    try:
        quality_result = quality_review(data.code)
    except Exception as e:
        quality_result = _error_result("Code Quality Judge", str(e))

    try:
        testing_result = testing_review(data.code)
    except Exception as e:
        testing_result = _error_result("Test Coverage Advisor", str(e))

    try:
        verdict_result = final_verdict(
            data.code,
            security_result,
            performance_result,
            quality_result,
            testing_result,
        )
    except Exception as e:
        verdict_result = {
            "overall_score": 0,
            "deployment_ready": False,
            "summary": f"Verdict agent failed: {e}",
            "priority_fixes": [],
            "cleaned_code": "",
        }

    return {
        "security": security_result,
        "performance": performance_result,
        "quality": quality_result,
        "testing": testing_result,
        "verdict": verdict_result,
    }


def _error_result(agent_name: str, error: str) -> dict:
    """Return a safe fallback result when an agent fails."""
    return {
        "agent": agent_name,
        "score": 0,
        "issues": [f"Agent failed: {error[:120]}"],
        "recommendations": ["Check API quota and retry."],
        "error": True,
    }