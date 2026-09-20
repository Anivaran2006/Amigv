import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Exam, Notice, Deadline, User, Subscription
from app.schemas.schemas import AIChatRequest, AIChatResponse
from app.routers.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/ask", response_model=AIChatResponse)
def ask_ai_assistant(
    request: AIChatRequest,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    question = request.question.strip()
    now = datetime.datetime.utcnow()

    # Retrieve official notices and deadlines
    notices = db.query(Notice, Exam.name.label("exam_name")).join(Exam, Notice.exam_id == Exam.id).order_by(Notice.detected_at.desc()).limit(10).all()
    deadlines = db.query(Deadline, Exam.name.label("exam_name")).join(Exam, Deadline.exam_id == Exam.id).filter(Deadline.deadline_date > now).order_by(Deadline.deadline_date.asc()).all()

    # Build verified official context
    context_lines = []
    context_lines.append("OFFICIAL VERIFIED EXAM DATA:")
    for d, ex_name in deadlines:
        days = (d.deadline_date - now).days
        context_lines.append(f"- Upcoming Deadline: {ex_name} - {d.event_name} on {d.deadline_date.strftime('%d %B %Y')} ({days} days remaining). Official: {d.is_official}")

    for n, ex_name in notices:
        context_lines.append(f"- Official Notice for {ex_name}: Title: '{n.title}', Type: {n.event_type}, Summary: '{n.summary}', Action: '{n.action_required}', Registration Start: '{n.registration_start}', Registration End: '{n.registration_end}', Exam Date: '{n.exam_date}', Official URL: {n.official_url}")

    context_str = "\n".join(context_lines)

    # 1. If OpenAI API Key is available, use it with strict instructions
    if settings.OPENAI_API_KEY:
        try:
            import httpx
            prompt = f"""
You are the ExamAlert AI Assistant ("What Should I Do?").
Answer the student's question strictly using the official verified exam records below.
NEVER fabricate dates, fees, or requirements. If information is not in the official notices or not yet announced, explicitly say "According to official announcements, this has not been released yet."

Verified Official Records:
{context_str}

Student Question: {question}

Provide a helpful, crisp, bulleted answer including concrete actions and official sources.
"""
            headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"}
            body = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1
            }
            with httpx.Client(timeout=12.0) as client:
                resp = client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=body)
                if resp.status_code == 200:
                    ans = resp.json()["choices"][0]["message"]["content"]
                    return AIChatResponse(
                        answer=ans,
                        sources=[n[0].official_url for n in notices[:3]],
                        suggested_actions=["Check official NTA portal", "Verify application confirmation page"]
                    )
        except Exception:
            pass

    # 2. Deterministic Knowledge Engine matching student queries
    q_lower = question.lower()
    answer_parts = []
    sources = []
    actions = []

    if "jee" in q_lower:
        jee_notices = [n for n, ex in notices if "jee" in ex.lower()]
        jee_deadlines = [d for d, ex in deadlines if "jee" in ex.lower()]
        if jee_deadlines:
            d = jee_deadlines[0]
            days = (d.deadline_date - now).days
            answer_parts.append(f"🎯 **JEE Main 2027 Session 1:**")
            answer_parts.append(f"• **Upcoming Deadline:** {d.event_name} is scheduled for **{d.deadline_date.strftime('%d %B %Y')}** ({days} days remaining).")
        if jee_notices:
            n = jee_notices[0]
            answer_parts.append(f"• **Registration Period:** {n.registration_start} to {n.registration_end}.")
            answer_parts.append(f"• **Required Action:** {n.action_required}")
            answer_parts.append(f"• **Official Website:** [jeemain.nta.nic.in]({n.official_url})")
            sources.append(n.official_url)
            actions.append("Complete JEE Main application on NTA portal")

    elif "gate" in q_lower:
        gate_notices = [n for n, ex in notices if "gate" in ex.lower()]
        gate_deadlines = [d for d, ex in deadlines if "gate" in ex.lower()]
        if gate_deadlines:
            d = gate_deadlines[0]
            days = (d.deadline_date - now).days
            answer_parts.append(f"⚙️ **GATE 2027:**")
            answer_parts.append(f"• **Regular Registration:** Closes on **{d.deadline_date.strftime('%d %B %Y')}** ({days} days remaining).")
        if gate_notices:
            n = gate_notices[0]
            answer_parts.append(f"• **Required Action:** {n.action_required}")
            answer_parts.append(f"• **Exam Dates:** {n.exam_date}")
            sources.append(n.official_url)
            actions.append("Upload photo/signature on GOAPS portal")

    elif "deadline" in q_lower or "due" in q_lower:
        answer_parts.append("📅 **Your Upcoming Verified Official Deadlines:**")
        for d, ex in deadlines:
            days = (d.deadline_date - now).days
            status_emoji = "🔴" if days <= 3 else ("🟡" if days <= 7 else "🟢")
            answer_parts.append(f"• {status_emoji} **{ex}** - {d.event_name}: **{d.deadline_date.strftime('%d %B %Y')}** ({days} days left)")
        actions.append("Review deadlines on dashboard")

    elif "document" in q_lower:
        answer_parts.append("📋 **Standard Official Documents Required Across National Exams:**")
        answer_parts.append("• Scanned passport-size photograph (JPG/JPEG, clear white background)")
        answer_parts.append("• Scanned candidate signature on white paper")
        answer_parts.append("• Category Certificate (SC/ST/OBC-NCL/EWS/PwD) if applicable")
        answer_parts.append("• Class 10th and 12th marks sheet / certificate for DOB verification")
        answer_parts.append("• Government Photo ID proof (Aadhaar Card, Passport, Voter ID)")
        actions.append("Verify document file sizes (typically 10KB to 200KB)")

    else:
        answer_parts.append("🤖 **ExamAlert AI Summary:**")
        answer_parts.append("Here are the latest official notices monitored across your tracked examinations:")
        for n, ex in notices[:3]:
            answer_parts.append(f"• **{ex}**: {n.title} (Action: {n.action_required})")
            sources.append(n.official_url)
        actions.append("Browse Exam Catalogue to subscribe to more examinations")

    answer_parts.append("\n⚠️ *Official Notice:* ExamAlert AI strictly prioritizes official authority releases. Dates not announced yet are never estimated.")

    return AIChatResponse(
        answer="\n".join(answer_parts),
        sources=list(set(sources)) if sources else ["https://jeemain.nta.nic.in"],
        suggested_actions=actions
    )
