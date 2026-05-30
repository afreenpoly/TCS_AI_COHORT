import os
import json
import re
import time
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Free tier: 14,400 req/day, 30 req/min
MODEL = "llama-3.3-70b-versatile"
MAX_RETRIES = 3
RETRY_DELAY = 5


def ask_gemini(prompt: str) -> str:
    """Keep the function name so all agents work without changes."""
    last_exc = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
            )
            return response.choices[0].message.content
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "rate" in err_str.lower() or "quota" in err_str.lower():
                wait = RETRY_DELAY * attempt
                print(f"[groq] Rate limited (attempt {attempt}/{MAX_RETRIES}). Retrying in {wait}s...")
                time.sleep(wait)
                last_exc = e
            else:
                raise

    raise RuntimeError(
        f"Groq rate limit hit after {MAX_RETRIES} retries."
    ) from last_exc


def extract_json(text: str) -> dict:
    text = re.sub(r"```(?:json)?\s*", "", text).strip()
    text = text.replace("```", "").strip()

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON found in response. Got:\n{text[:300]}")

    return json.loads(match.group())


# import os
# import json
# import re
# import time
# from dotenv import load_dotenv

# load_dotenv()

# import google.generativeai as genai

# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# MODEL = "gemini-2.0-flash"
# MAX_RETRIES = 3
# RETRY_DELAY = 5


# def ask_gemini(prompt: str) -> str:
#     model = genai.GenerativeModel(MODEL)
#     last_exc = None

#     for attempt in range(1, MAX_RETRIES + 1):
#         try:
#             response = model.generate_content(prompt)
#             return response.text
#         except Exception as e:
#             err_str = str(e)
#             if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
#                 wait = RETRY_DELAY * attempt
#                 print(f"[gemini] Rate limited (attempt {attempt}/{MAX_RETRIES}). Retrying in {wait}s...")
#                 time.sleep(wait)
#                 last_exc = e
#             else:
#                 raise

#     raise RuntimeError(
#         f"Gemini quota exceeded after {MAX_RETRIES} retries. "
#         "Check your usage at https://ai.dev/rate-limit"
#     ) from last_exc


# def extract_json(text: str) -> dict:
#     # Strip markdown code fences if present
#     text = re.sub(r"```(?:json)?\s*", "", text).strip()
#     text = text.replace("```", "").strip()

#     match = re.search(r"\{.*\}", text, re.DOTALL)
#     if not match:
#         raise ValueError(f"No JSON found in response. Got:\n{text[:300]}")

#     return json.loads(match.group())