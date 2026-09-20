import re
import json
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

CATEGORIES = [
    "REGISTRATION_OPEN",
    "REGISTRATION_CLOSING",
    "APPLICATION_CORRECTION",
    "ADMIT_CARD",
    "EXAM_DATE",
    "ANSWER_KEY",
    "RESULT",
    "COUNSELLING",
    "IMPORTANT_NOTICE",
    "ELIGIBILITY",
    "FEE_UPDATE",
    "SYLLABUS",
    "OTHER"
]

def analyze_notice(exam_name: str, title: str, content: str, official_url: str) -> Dict[str, Any]:
    """
    Analyzes an official exam notice and extracts structured info without hallucination.
    Uses OpenAI if OPENAI_API_KEY is provided; otherwise uses deterministic NLP heuristic analyzer.
    """
    if settings.OPENAI_API_KEY:
        try:
            return _analyze_with_openai(exam_name, title, content, official_url)
        except Exception as e:
            logger.warning(f"OpenAI analysis failed, falling back to heuristic analyzer: {e}")

    return _analyze_with_heuristics(exam_name, title, content, official_url)

def _analyze_with_openai(exam_name: str, title: str, content: str, official_url: str) -> Dict[str, Any]:
    import httpx
    prompt = f"""
You are the official Notice Analysis AI for ExamAlert AI.
Analyze this official notice for the competitive exam: "{exam_name}".

CRITICAL RULE: NEVER FABRICATE OR INVENT INFORMATION.
If any date, fee, eligibility, or document is not explicitly stated in the text, you MUST write: "Not specified in the official notice."

Title: {title}
Content: {content}
Official URL: {official_url}

Allowed event_types:
REGISTRATION_OPEN, REGISTRATION_CLOSING, APPLICATION_CORRECTION, ADMIT_CARD, EXAM_DATE, ANSWER_KEY, RESULT, COUNSELLING, IMPORTANT_NOTICE, ELIGIBILITY, FEE_UPDATE, SYLLABUS, OTHER

Return STRICT JSON ONLY matching this structure:
{{
  "exam": "{exam_name}",
  "event_type": "ONE_OF_ALLOWED_TYPES",
  "title": "Clean concise title",
  "summary": "2-3 sentence factual summary of what changed",
  "registration_start": "Date or 'Not specified in the official notice.'",
  "registration_end": "Date or 'Not specified in the official notice.'",
  "exam_date": "Date or 'Not specified in the official notice.'",
  "important_dates": ["list of dates explicitly stated in notice"],
  "eligibility": "Eligibility requirements or 'Not specified in the official notice.'",
  "fees": "Fees or 'Not specified in the official notice.'",
  "documents": ["list of documents mentioned or empty"],
  "action_required": "What concrete step should the student take right now?",
  "official_url": "{official_url}",
  "importance": "high" or "medium" or "low"
}}
"""
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    body = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are a strict official document extraction AI. You never hallucinate."},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.0
    }
    with httpx.Client(timeout=15.0) as client:
        resp = client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=body)
        resp.raise_for_status()
        data = resp.json()
        content_text = data["choices"][0]["message"]["content"]
        return json.loads(content_text)

def _analyze_with_heuristics(exam_name: str, title: str, content: str, official_url: str) -> Dict[str, Any]:
    """
    Deterministic rule-based extractor that strictly adheres to official source content.
    Never invents dates or details.
    """
    full_text = f"{title} {content}".lower()

    # Determine event type
    event_type = "IMPORTANT_NOTICE"
    if "correction" in full_text:
        event_type = "APPLICATION_CORRECTION"
    elif "admit card" in full_text or "hall ticket" in full_text:
        event_type = "ADMIT_CARD"
    elif "answer key" in full_text:
        event_type = "ANSWER_KEY"
    elif "result" in full_text or "rank card" in full_text or "scorecard" in full_text:
        event_type = "RESULT"
    elif "counselling" in full_text or "seat allotment" in full_text:
        event_type = "COUNSELLING"
    elif "registration open" in full_text or "apply online" in full_text or "application form" in full_text or "session 1 registration" in full_text:
        event_type = "REGISTRATION_OPEN"
    elif "closing" in full_text or "last date" in full_text or "extended" in full_text or "deadline" in full_text:
        event_type = "REGISTRATION_CLOSING"
    elif "exam date" in full_text or "schedule of examination" in full_text:
        event_type = "EXAM_DATE"
    elif "syllabus" in full_text:
        event_type = "SYLLABUS"
    elif "eligibility" in full_text:
        event_type = "ELIGIBILITY"
    elif "fee" in full_text:
        event_type = "FEE_UPDATE"

    # Date pattern extraction
    # Matches patterns like: 20 September 2026, 20.10.2026, 20/10/2026, October 20, 2026
    date_regex = r'\b(?:\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{1,2}[./-]\d{1,2}[./-]\d{4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4})\b'
    
    extracted_dates = re.findall(date_regex, content, re.IGNORECASE)
    extracted_dates_title = re.findall(date_regex, title, re.IGNORECASE)
    all_dates = list(dict.fromkeys(extracted_dates_title + extracted_dates))

    reg_start = "Not specified in the official notice."
    reg_end = "Not specified in the official notice."
    exam_date = "Not specified in the official notice."

    # Look for contextual cues
    if "from" in full_text and len(all_dates) >= 2:
        reg_start = all_dates[0]
        reg_end = all_dates[1]
    elif len(all_dates) >= 1 and ("last date" in full_text or "closing" in full_text or "deadline" in full_text or "upto" in full_text):
        reg_end = all_dates[-1]
    elif len(all_dates) >= 1:
        if event_type == "EXAM_DATE":
            exam_date = all_dates[0]
        elif event_type in ["REGISTRATION_OPEN", "REGISTRATION_CLOSING"]:
            reg_end = all_dates[0]

    # Action required extraction
    if event_type == "REGISTRATION_OPEN":
        action_required = "Visit the official portal and complete online registration before the deadline."
    elif event_type == "REGISTRATION_CLOSING":
        action_required = "Verify your application submission and complete fee payment immediately."
    elif event_type == "APPLICATION_CORRECTION":
        action_required = "Log in to the candidate portal to verify details and make corrections if needed."
    elif event_type == "ADMIT_CARD":
        action_required = "Download your admit card, verify exam center details, and read test day instructions."
    elif event_type == "EXAM_DATE":
        action_required = "Mark the official examination dates on your schedule and prepare accordingly."
    elif event_type == "ANSWER_KEY":
        action_required = "Compare your response sheet with the provisional key and file objections if needed."
    elif event_type == "RESULT":
        action_required = "Download your official scorecard and check eligibility for the next stage/counselling."
    else:
        action_required = "Review the official notification on the official portal."

    # Fees extraction
    fee_match = re.search(r'(?:rs\.?|inr|₹)\s*[\d,]+', content, re.IGNORECASE)
    fees = fee_match.group(0) if fee_match else "Not specified in the official notice."

    # Summary generator
    summary = content[:220].strip()
    if not summary.endswith('.'):
        summary += '...'

    importance = "high" if event_type in ["REGISTRATION_OPEN", "REGISTRATION_CLOSING", "ADMIT_CARD", "EXAM_DATE", "RESULT"] else "medium"

    return {
        "exam": exam_name,
        "event_type": event_type,
        "title": title,
        "summary": summary if summary else f"Official update released regarding {event_type.replace('_', ' ').title()}.",
        "registration_start": reg_start,
        "registration_end": reg_end,
        "exam_date": exam_date,
        "important_dates": all_dates,
        "eligibility": "Not specified in the official notice.",
        "fees": fees,
        "documents": [],
        "action_required": action_required,
        "official_url": official_url,
        "importance": importance
    }

def format_telegram_alert(exam_name: str, analysis: Dict[str, Any]) -> str:
    """
    Formats an official alert for Telegram matching specifications.
    """
    title = analysis.get("title", f"{exam_name} Official Update")
    summary = analysis.get("summary", "")
    action = analysis.get("action_required", "Verify details on the official website.")
    official_url = analysis.get("official_url", "https://nta.ac.in")
    
    reg_start = analysis.get("registration_start")
    reg_end = analysis.get("registration_end")
    exam_date = analysis.get("exam_date")

    dates_block = ""
    if reg_start != "Not specified in the official notice." or reg_end != "Not specified in the official notice.":
        dates_block = f"\n📅 *Registration:*\n{reg_start} – {reg_end}\n"
    elif exam_date != "Not specified in the official notice.":
        dates_block = f"\n📅 *Exam Date:*\n{exam_date}\n"

    msg = f"""🚨 *{exam_name} Update*

*{title}*

{summary}
{dates_block}
📝 *Action Required:*
{action}

🔗 *Official Website:*
{official_url}

⚠️ *Notice:* Please verify all details on the official examination portal.
Source: Official Exam Website
"""
    return msg.strip()
