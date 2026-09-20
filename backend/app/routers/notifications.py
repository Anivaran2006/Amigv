from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import NotificationLog, Exam, User
from app.schemas.schemas import NotificationOut
from app.routers.auth import get_current_user
from app.services.telegram_service import telegram_service
from app.services.email_service import email_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationOut])
def get_user_notifications(
    user_id: Optional[int] = None,
    channel: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(NotificationLog, Exam.name.label("exam_name")).outerjoin(Exam, NotificationLog.exam_id == Exam.id)
    if user_id:
        query = query.filter(NotificationLog.user_id == user_id)
    if channel and channel != "all":
        query = query.filter(NotificationLog.channel == channel)

    rows = query.order_by(NotificationLog.sent_at.desc()).limit(50).all()

    result = []
    for notif, exam_name in rows:
        result.append(NotificationOut(
            id=notif.id,
            user_id=notif.user_id,
            exam_id=notif.exam_id,
            exam_name=exam_name or "ExamAlert AI System",
            notice_id=notif.notice_id,
            channel=notif.channel,
            sent_at=notif.sent_at,
            status=notif.status,
            title=notif.title,
            message_preview=notif.message_preview
        ))
    return result

@router.post("/test")
def send_test_notification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = {}
    if current_user.notify_telegram and current_user.telegram_chat_id:
        tg_text = f"""🔔 *ExamAlert AI Test Alert*

Hello {current_user.full_name},
This is a test notification verifying your Telegram connection!

✅ Status: Connected & Monitoring Active
🎯 Never miss an exam deadline.
"""
        tg_res = telegram_service.send_message(current_user.telegram_chat_id, tg_text)
        db.add(NotificationLog(
            user_id=current_user.id,
            exam_id=1,
            channel="telegram",
            title="🔔 ExamAlert AI Test Notification",
            message_preview="Test alert successfully dispatched to your Telegram chat.",
            status="sent"
        ))
        results["telegram"] = tg_res

    if current_user.notify_email and current_user.email:
        email_res = email_service.send_email(
            current_user.email,
            "🔔 Test Notification from ExamAlert AI",
            f"<h3>Hello {current_user.full_name},</h3><p>Your email notification channel is active and functioning properly.</p><p>ExamAlert AI is actively tracking official exam portals for you.</p>"
        )
        db.add(NotificationLog(
            user_id=current_user.id,
            exam_id=1,
            channel="email",
            title="🔔 ExamAlert AI Test Email",
            message_preview="Test email successfully dispatched to verify your mailbox.",
            status="sent"
        ))
        results["email"] = email_res

    db.commit()
    return {"message": "Test notifications triggered successfully", "details": results}
