from backend.services.gemini import ask_gemini, extract_json

def performance_review(code):

    prompt = f"""
You are a Performance Analyzer.

Return ONLY valid JSON.

{{
  "agent":"Performance Analyzer",
  "score":0,
  "issues":[],
  "recommendations":[]
}}

Analyze:
- Time complexity
- Memory usage
- Inefficient loops
- Redundant computations
- Database performance issues

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