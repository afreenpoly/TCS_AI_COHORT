from backend.services.gemini import ask_gemini, extract_json

def testing_review(code):

    prompt = f"""
You are a Test Coverage Advisor.

Return ONLY valid JSON.

{{
  "agent":"Test Coverage Advisor",
  "score":0,
  "issues":[],
  "recommendations":[]
}}

Scoring:
100 = excellent testability
75 = good testability
50 = average
25 = poor
0 = very poor

Analyze:
- Missing test cases
- Edge cases
- Exception handling
- Integration testing needs
- Unit testing opportunities
- Code coverage gaps

Code:
{code}
"""

    response = ask_gemini(prompt)
    return extract_json(response)