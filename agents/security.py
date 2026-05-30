from services.gemini import ask_gemini

def security_review(code):

    prompt = f"""
You are a Security Auditor.

Analyze this code for:
- Hardcoded secrets
- SQL Injection
- XSS
- Command Injection
- Authentication flaws
- Sensitive data exposure

Provide:
1. Security Score out of 100
2. Issues found
3. Recommendations

Code:
{code}
"""

    return ask_gemini(prompt)