from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.security import security_review
from agents.performance import performance_review
from agents.quality import quality_review
from agents.testing import testing_review
from agents.verdict import final_verdict

app = FastAPI()

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

    security_result = security_review(data.code)

    performance_result = performance_review(
        data.code
    )

    quality_result = quality_review(
        data.code
    )

    testing_result = testing_review(
        data.code
    )

    verdict_result = final_verdict(
        data.code,
        security_result,
        performance_result,
        quality_result,
        testing_result
    )

    return {
        "security": security_result,
        "performance": performance_result,
        "quality": quality_result,
        "testing": testing_result,
        "verdict": verdict_result
    }