from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

    return {
        "received_code_length": len(data.code),
        "preview": data.code[:100],
        "score": 85
    }