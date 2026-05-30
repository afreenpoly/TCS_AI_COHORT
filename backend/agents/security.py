from services.gemini import ask_gemini, extract_json
import json

def security_review(code):

    prompt = f"""
You are a Security Auditor.

Return ONLY valid JSON.

{{
  "agent":"Security Auditor",
  "score":0,
  "issues":[],
  "recommendations":[]
}}

Scoring:
100 = no security issues
75 = minor issues
50 = moderate issues
25 = serious issues
0 = critical vulnerabilities

Code:
{code}
"""

    response = ask_gemini(prompt)
    return extract_json(response)
