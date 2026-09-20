import logging
import httpx
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class TelegramService:
    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}" if self.bot_token else None

    def send_message(self, chat_id: str, text: str, parse_mode: str = "Markdown") -> Dict[str, Any]:
        """
        Sends a Telegram message. If bot token is not provided or fails,
        logs the message cleanly and marks as simulated.
        """
        if not chat_id:
            logger.info(f"[Telegram] No chat_id provided, skipping message.")
            return {"status": "skipped", "reason": "No Telegram Chat ID"}

        if self.base_url and self.bot_token:
            try:
                url = f"{self.base_url}/sendMessage"
                payload = {
                    "chat_id": chat_id,
                    "text": text,
                    "parse_mode": parse_mode,
                    "disable_web_page_preview": False
                }
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        logger.info(f"[Telegram] Successfully sent message to {chat_id}")
                        return {"status": "sent", "chat_id": chat_id, "data": resp.json()}
                    else:
                        logger.warning(f"[Telegram] API returned status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"[Telegram] Network error sending to {chat_id}: {e}")

        # Simulated fallback
        logger.info(f"[Telegram Simulated] To: {chat_id}\n{text}")
        return {
            "status": "simulated",
            "chat_id": chat_id,
            "message": text,
            "note": "Live Telegram Bot Token not set or network fallback; message logged and delivered to in-app stream."
        }

    def send_welcome_message(self, chat_id: str, full_name: str) -> Dict[str, Any]:
        text = f"""👋 *Welcome to ExamAlert AI!*

Hello {full_name}, your account has been successfully created.

🎯 *You can now track important updates for competitive exams.*

Subscribe to JEE, NEET, GATE, CAT, SSC, UPSC and other exams from your dashboard.

We'll notify you the moment important official updates are released.

🚀 *ExamAlert AI*
_Never Miss an Exam Deadline._
"""
        return self.send_message(chat_id, text)

    def send_subscription_confirmation(self, chat_id: str, exam_name: str) -> Dict[str, Any]:
        text = f"""✅ *Subscription Activated*

You are now tracking:

🎓 *{exam_name}*

We'll notify you about:
🟢 Registration
📅 Important deadlines
🎫 Admit Card
📝 Answer Key
🏆 Result
🎓 Counselling
📢 Important official notices

You're all set! 🚀

_ExamAlert AI · Official Source Verification_
"""
        return self.send_message(chat_id, text)

    def send_unsubscription_message(self, chat_id: str, exam_name: str) -> Dict[str, Any]:
        text = f"""ℹ️ *Subscription Paused*

You have unsubscribed from:
🎓 *{exam_name}*

You will no longer receive alerts for this exam. You can re-subscribe anytime from your dashboard.
"""
        return self.send_message(chat_id, text)

    def send_deadline_reminder(self, chat_id: str, exam_name: str, event_name: str, days_remaining: int, deadline_str: str, official_url: str) -> Dict[str, Any]:
        text = f"""⏰ *{exam_name} Deadline Reminder*

*{exam_name} {event_name} closes in {days_remaining} day{'s' if days_remaining != 1 else ''}!*

📅 *Official Last Date:* {deadline_str}

If you haven't completed your application or required action, please visit the official examination portal immediately.

🔗 *Official Link:*
{official_url}

⚠️ _Source: Official Examination Authority_
"""
        return self.send_message(chat_id, text)

telegram_service = TelegramService()
