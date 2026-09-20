from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Exam, Subscription, NotificationLog
from app.schemas.schemas import SubscriptionToggle
from app.routers.auth import get_current_user
from app.services.telegram_service import telegram_service
from app.services.email_service import email_service

router = APIRouter(prefix="/exams", tags=["Subscriptions"])

@router.post("/{exam_id}/subscribe")
def subscribe_to_exam(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    subscription = db.query(Subscription).filter_by(user_id=current_user.id, exam_id=exam.id).first()
    if subscription:
        if subscription.active:
            return {"message": f"Already subscribed to {exam.name}", "is_subscribed": True}
        else:
            subscription.active = True
    else:
        subscription = Subscription(user_id=current_user.id, exam_id=exam.id, active=True)
        db.add(subscription)

    # Immediately trigger subscription confirmation notifications!
    if current_user.notify_telegram and current_user.telegram_chat_id:
        telegram_service.send_subscription_confirmation(current_user.telegram_chat_id, exam.name)
        db.add(NotificationLog(
            user_id=current_user.id,
            exam_id=exam.id,
            channel="telegram",
            title=f"✅ Tracking Activated: {exam.name}",
            message_preview=f"You are now tracking {exam.name}. Real-time alerts for registration, deadlines, and admit cards are enabled.",
            status="sent"
        ))

    if current_user.notify_email and current_user.email:
        email_service.send_subscription_email(
            current_user.email,
            current_user.full_name,
            exam.name,
            exam.organizing_authority,
            exam.official_website
        )
        db.add(NotificationLog(
            user_id=current_user.id,
            exam_id=exam.id,
            channel="email",
            title=f"✅ Subscription Activated: {exam.name}",
            message_preview=f"Subscription confirmation dispatched for {exam.name} ({exam.organizing_authority}).",
            status="sent"
        ))

    db.commit()
    return {"message": f"Successfully subscribed to {exam.name}", "is_subscribed": True}

@router.delete("/{exam_id}/subscribe")
def unsubscribe_from_exam(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    subscription = db.query(Subscription).filter_by(user_id=current_user.id, exam_id=exam.id).first()
    if not subscription or not subscription.active:
        return {"message": f"Not subscribed to {exam.name}", "is_subscribed": False}

    subscription.active = False

    if current_user.notify_telegram and current_user.telegram_chat_id:
        telegram_service.send_unsubscription_message(current_user.telegram_chat_id, exam.name)
        db.add(NotificationLog(
            user_id=current_user.id,
            exam_id=exam.id,
            channel="telegram",
            title=f"ℹ️ Unsubscribed: {exam.name}",
            message_preview=f"You have paused notifications for {exam.name}.",
            status="sent"
        ))

    db.commit()
    return {"message": f"Successfully unsubscribed from {exam.name}", "is_subscribed": False}
