from backend.services.gemini import ask_gemini, extract_json

def final_verdict(
    code,
    security_result,
    performance_result,
    quality_result,
    testing_result
):

    prompt = f"""
You are the Final Verdict Agent.

Return ONLY valid JSON.

{{
  "overall_score": 0,
  "deployment_ready": false,
  "summary": "",
  "priority_fixes": [],
  "cleaned_code": ""
}}

Security Review:
{security_result}

Performance Review:
{performance_result}

Quality Review:
{quality_result}

Testing Review:
{testing_result}

Original Code:
{code}

Tasks:
1. Calculate overall score out of 100
2. Determine deployment readiness
3. Summarize major findings
4. Produce prioritized fixes
5. Rewrite the code following best practices
"""

    response = ask_gemini(prompt)
    return extract_json(response)