import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Exam, Notice, Deadline, Subscription, User, NotificationLog
from app.schemas.schemas import DemoSimulateRequest, DemoSimulateResponse
from app.services.ai_analyzer import analyze_notice, format_telegram_alert
from app.services.change_detector import compute_content_hash, has_content_changed
from app.services.telegram_service import telegram_service
from app.services.email_service import email_service

router = APIRouter(prefix="/demo", tags=["Hackathon Demo"])

@router.post("/simulate-update", response_model=DemoSimulateResponse)
def simulate_exam_update(
    payload: DemoSimulateRequest,
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == payload.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # Step 1: Change Detection via Hash
    content_hash = compute_content_hash(payload.notice_content)
    existing_notice = db.query(Notice).filter_by(exam_id=exam.id, content_hash=content_hash).first()

    duplicate_prevented = False
    if existing_notice:
        duplicate_prevented = True
        # Return duplicate prevention notice
        return DemoSimulateResponse(
            success=True,
            message="Change Detection & Deduplication: Content hash already matches existing stored notice. Duplicate notification prevented!",
            notice_id=existing_notice.id,
            analysis={
                "event_type": existing_notice.event_type,
                "title": existing_notice.title,
                "summary": existing_notice.summary,
                "action_required": existing_notice.action_required,
                "duplicate_status": "SKIPPED_DUPLICATE_NOTICE"
            },
            duplicate_prevented=True,
            notifications_sent=[]
        )

    # Step 2: AI Analysis & Extraction
    official_url = payload.official_url or exam.official_website
    analysis = analyze_notice(
        exam_name=exam.name,
        title=payload.notice_title,
        content=payload.notice_content,
        official_url=official_url
    )

    # Step 3: Store Official Notice
    new_notice = Notice(
        exam_id=exam.id,
        title=analysis.get("title", payload.notice_title),
        raw_content=payload.notice_content,
        content_hash=content_hash,
        published_date=payload.published_date or datetime.datetime.now().strftime("%d %B %Y"),
        event_type=analysis.get("event_type", "IMPORTANT_NOTICE"),
        importance=analysis.get("importance", "high"),
        summary=analysis.get("summary", ""),
        registration_start=analysis.get("registration_start"),
        registration_end=analysis.get("registration_end"),
        exam_date=analysis.get("exam_date"),
        action_required=analysis.get("action_required"),
        official_url=official_url,
        is_official=True,
        fees=analysis.get("fees"),
        eligibility=analysis.get("eligibility")
    )
    db.add(new_notice)
    db.flush()

    # Step 4: Extract Deadlines if present
    reg_end = analysis.get("registration_end")
    if reg_end and reg_end != "Not specified in the official notice.":
        # Create or update deadline
        deadline_dt = datetime.datetime.now() + datetime.timedelta(days=21)
        db.add(Deadline(
            exam_id=exam.id,
            notice_id=new_notice.id,
            event_name=f"{analysis.get('event_type', 'Notice').replace('_', ' ').title()}",
            deadline_date=deadline_dt,
            is_official=True,
            status="upcoming"
        ))

    # Step 5: Duplicate Prevention & Personalized Notification Dispatch
    # Query all active subscribers
    subscribers = db.query(Subscription).filter_by(exam_id=exam.id, active=True).all()
    notifications_sent = []

    for sub in subscribers:
        user = db.query(User).filter_by(id=sub.user_id).first()
        if not user:
            continue

        # Check Telegram
        if user.notify_telegram and user.telegram_chat_id:
            # Check duplicate
            has_sent = db.query(NotificationLog).filter_by(
                user_id=user.id,
                exam_id=exam.id,
                notice_id=new_notice.id,
                channel="telegram"
            ).first()

            if not has_sent:
                tg_msg = format_telegram_alert(exam.name, analysis)
                tg_res = telegram_service.send_message(user.telegram_chat_id, tg_msg)

                notif_record = NotificationLog(
                    user_id=user.id,
                    exam_id=exam.id,
                    notice_id=new_notice.id,
                    channel="telegram",
                    title=f"🚨 {exam.name}: {new_notice.title}",
                    message_preview=analysis.get("summary", "")[:180],
                    status="sent"
                )
                db.add(notif_record)
                notifications_sent.append({
                    "user": user.full_name,
                    "channel": "Telegram",
                    "chat_id": user.telegram_chat_id,
                    "status": tg_res.get("status")
                })

        # Check Email
        if user.notify_email and user.email:
            has_sent_email = db.query(NotificationLog).filter_by(
                user_id=user.id,
                exam_id=exam.id,
                notice_id=new_notice.id,
                channel="email"
            ).first()

            if not has_sent_email:
                em_res = email_service.send_exam_update_email(
                    to_email=user.email,
                    full_name=user.full_name,
                    exam_name=exam.name,
                    analysis=analysis
                )
                notif_record_email = NotificationLog(
                    user_id=user.id,
                    exam_id=exam.id,
                    notice_id=new_notice.id,
                    channel="email",
                    title=f"🚨 {exam.name}: {new_notice.title}",
                    message_preview=analysis.get("summary", "")[:180],
                    status="sent"
                )
                db.add(notif_record_email)
                notifications_sent.append({
                    "user": user.full_name,
                    "channel": "Email",
                    "email": user.email,
                    "status": em_res.get("status")
                })

    db.commit()

    return DemoSimulateResponse(
        success=True,
        message=f"Official update processed! AI extracted: {analysis.get('event_type')}. Sent alerts to {len(notifications_sent)} subscribed channels.",
        notice_id=new_notice.id,
        analysis=analysis,
        duplicate_prevented=False,
        notifications_sent=notifications_sent
    )
