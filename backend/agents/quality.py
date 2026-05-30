from backend.services.gemini import ask_gemini, extract_json

def quality_review(code):

    prompt = f"""
You are a Code Quality Judge.

Return ONLY valid JSON.

{{
  "agent":"Code Quality Judge",
  "score":0,
  "issues":[],
  "recommendations":[]
}}

Scoring:
100 = excellent quality
75 = good quality
50 = average quality
25 = poor quality
0 = very poor quality

Analyze:
- Readability
- Maintainability
- Naming conventions
- Code duplication
- SOLID principles
- Documentation
- Clean code practices

Code:
{code}
"""

    response = ask_gemini(prompt)
    return extract_json(response)