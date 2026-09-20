import datetime
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app.models.models import Deadline, Exam, Subscription, User, NotificationLog
from app.services.telegram_service import telegram_service
from app.services.email_service import email_service
from app.config import settings

logger = logging.getLogger(__name__)

def check_deadline_reminders():
    """
    Checks upcoming deadlines and sends 7-day, 3-day, and 1-day reminders
    to all active subscribers of the respective exam.
    Prevents duplicate notifications.
    """
    db = SessionLocal()
    try:
        now = datetime.datetime.utcnow()
        deadlines = db.query(Deadline).filter(Deadline.deadline_date > now).all()

        for d in deadlines:
            exam = db.query(Exam).filter(Exam.id == d.exam_id).first()
            if not exam:
                continue

            diff = d.deadline_date - now
            days_remaining = diff.days

            # 7-day reminder
            if days_remaining <= 7 and days_remaining > 3 and not d.reminder_7d_sent:
                _dispatch_reminders_for_deadline(db, exam, d, days_remaining)
                d.reminder_7d_sent = True
                db.commit()

            # 3-day reminder
            elif days_remaining <= 3 and days_remaining > 1 and not d.reminder_3d_sent:
                _dispatch_reminders_for_deadline(db, exam, d, days_remaining)
                d.reminder_3d_sent = True
                db.commit()

            # 1-day reminder
            elif days_remaining <= 1 and not d.reminder_1d_sent:
                _dispatch_reminders_for_deadline(db, exam, d, max(1, days_remaining))
                d.reminder_1d_sent = True
                db.commit()

    except Exception as e:
        logger.error(f"[Scheduler] Error checking deadlines: {e}")
    finally:
        db.close()

def _dispatch_reminders_for_deadline(db, exam: Exam, deadline: Deadline, days_remaining: int):
    # Find all active subscribers for this exam
    subs = db.query(Subscription).filter_by(exam_id=exam.id, active=True).all()
    deadline_str = deadline.deadline_date.strftime("%d %B %Y")
    
    for sub in subs:
        user = db.query(User).filter_by(id=sub.user_id).first()
        if not user:
            continue

        # Check duplicate for Telegram
        if user.notify_telegram and user.telegram_chat_id:
            existing = db.query(NotificationLog).filter_by(
                user_id=user.id,
                exam_id=exam.id,
                notice_id=deadline.notice_id,
                channel="telegram",
                title=f"⏰ {exam.name} Deadline Reminder ({days_remaining}d)"
            ).first()
            if not existing:
                telegram_service.send_deadline_reminder(
                    chat_id=user.telegram_chat_id,
                    exam_name=exam.name,
                    event_name=deadline.event_name,
                    days_remaining=days_remaining,
                    deadline_str=deadline_str,
                    official_url=exam.official_website
                )
                db.add(NotificationLog(
                    user_id=user.id,
                    exam_id=exam.id,
                    notice_id=deadline.notice_id,
                    channel="telegram",
                    title=f"⏰ {exam.name} Deadline Reminder ({days_remaining}d)",
                    message_preview=f"{deadline.event_name} deadline in {days_remaining} days on {deadline_str}.",
                    status="sent"
                ))

        # Check duplicate for Email
        if user.notify_email and user.email:
            existing = db.query(NotificationLog).filter_by(
                user_id=user.id,
                exam_id=exam.id,
                notice_id=deadline.notice_id,
                channel="email",
                title=f"⏰ {exam.name} Deadline Reminder ({days_remaining}d)"
            ).first()
            if not existing:
                email_service.send_deadline_reminder_email(
                    to_email=user.email,
                    full_name=user.full_name,
                    exam_name=exam.name,
                    event_name=deadline.event_name,
                    days_remaining=days_remaining,
                    deadline_str=deadline_str,
                    official_url=exam.official_website
                )
                db.add(NotificationLog(
                    user_id=user.id,
                    exam_id=exam.id,
                    notice_id=deadline.notice_id,
                    channel="email",
                    title=f"⏰ {exam.name} Deadline Reminder ({days_remaining}d)",
                    message_preview=f"{deadline.event_name} deadline in {days_remaining} days on {deadline_str}.",
                    status="sent"
                ))

    db.commit()

scheduler = BackgroundScheduler()

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(check_deadline_reminders, 'interval', minutes=15, id='check_deadlines')
        scheduler.start()
        logger.info("[Scheduler] Background scheduler started successfully.")
