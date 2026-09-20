import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.resend_api_key = settings.RESEND_API_KEY
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.FROM_EMAIL

    def _render_wrapper(self, title: str, content_html: str) -> str:
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #0f172a;
    }}
    .container {{
      max-width: 580px;
      margin: 30px auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }}
    .header {{
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
      padding: 28px 32px;
      color: #ffffff;
    }}
    .header h1 {{
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }}
    .header p {{
      margin: 6px 0 0 0;
      font-size: 13px;
      opacity: 0.9;
    }}
    .body-content {{
      padding: 32px;
      line-height: 1.6;
      font-size: 15px;
    }}
    .badge {{
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 12px;
    }}
    .badge-urgent {{
      background-color: #fee2e2;
      color: #dc2626;
    }}
    .badge-success {{
      background-color: #dcfce7;
      color: #16a34a;
    }}
    .badge-info {{
      background-color: #e0e7ff;
      color: #4338ca;
    }}
    .box {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 20px 0;
    }}
    .btn {{
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff !important;
      font-weight: 600;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      margin-top: 16px;
      text-align: center;
    }}
    .footer {{
      padding: 20px 32px;
      background-color: #f1f5f9;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ExamAlert AI</h1>
      <p>Never Miss an Exam Deadline</p>
    </div>
    <div class="body-content">
      {content_html}
    </div>
    <div class="footer">
      <p>You received this official notification because you are registered with ExamAlert AI.</p>
      <p>All information is directly verified from official examination portals.</p>
    </div>
  </div>
</body>
</html>"""

    def send_email(self, to_email: str, subject: str, html_body: str) -> Dict[str, Any]:
        """
        Dispatches HTML email via Resend API or SMTP if configured.
        Falls back to simulated delivery and logging.
        """
        # 1. Try Resend if configured
        if self.resend_api_key:
            try:
                import httpx
                resp = httpx.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {self.resend_api_key}", "Content-Type": "application/json"},
                    json={"from": self.from_email, "to": [to_email], "subject": subject, "html": html_body},
                    timeout=10.0
                )
                if resp.status_code in [200, 201]:
                    logger.info(f"[Email] Dispatched via Resend to {to_email}")
                    return {"status": "sent", "channel": "email", "provider": "resend", "id": resp.json().get("id")}
            except Exception as e:
                logger.warning(f"[Email] Resend failed: {e}")

        # 2. Try SMTP if configured
        if self.smtp_host and self.smtp_user and self.smtp_password:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = self.from_email
                msg["To"] = to_email
                msg.attach(MIMEText(html_body, "html"))

                with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_password)
                    server.sendmail(self.from_email, [to_email], msg.as_string())
                logger.info(f"[Email] Dispatched via SMTP to {to_email}")
                return {"status": "sent", "channel": "email", "provider": "smtp"}
            except Exception as e:
                logger.warning(f"[Email] SMTP dispatch failed: {e}")

        # 3. Simulated Fallback
        logger.info(f"[Email Simulated] To: {to_email} | Subject: {subject}")
        return {
            "status": "simulated",
            "channel": "email",
            "to": to_email,
            "subject": subject,
            "note": "SMTP/Resend not set; email rendered and saved to student in-app notification center."
        }

    def send_welcome_email(self, to_email: str, full_name: str) -> Dict[str, Any]:
        content = f"""
        <div class="badge badge-success">Account Ready</div>
        <h2>Welcome to ExamAlert AI, {full_name}! 👋</h2>
        <p>Your student notification account has been created. ExamAlert AI is built with one mission: <strong>Never miss an official exam deadline.</strong></p>
        <div class="box">
          <p style="margin: 0 0 8px 0; font-weight: 600;">What you can do right now:</p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Subscribe to exams like <strong>JEE Main, NEET, GATE, CAT, SSC, UPSC</strong></li>
            <li>Connect your Telegram account for instant mobile alerts</li>
            <li>Track verified official registration and admit card dates</li>
          </ul>
        </div>
        <p>Head to your dashboard to choose the exams you are preparing for.</p>
        <a href="http://localhost:5173/dashboard" class="btn">Go to Student Dashboard →</a>
        """
        subject = "Welcome to ExamAlert AI — Never Miss an Exam Deadline"
        html = self._render_wrapper(subject, content)
        return self.send_email(to_email, subject, html)

    def send_subscription_email(self, to_email: str, full_name: str, exam_name: str, authority: str, website: str) -> Dict[str, Any]:
        content = f"""
        <div class="badge badge-info">Subscription Active</div>
        <h2>Tracking Activated: {exam_name} 🎓</h2>
        <p>Hello {full_name}, you have successfully subscribed to real-time official alerts for <strong>{exam_name}</strong>.</p>
        <div class="box">
          <p style="margin: 0 0 6px 0;"><strong>Organizing Authority:</strong> {authority}</p>
          <p style="margin: 0 0 6px 0;"><strong>Official Website:</strong> <a href="{website}" target="_blank">{website}</a></p>
          <p style="margin: 0;"><strong>Monitoring Status:</strong> Active (Checking official portal every hour)</p>
        </div>
        <p>Whenever {authority} issues new updates regarding registrations, corrections, admit cards, or results, you will receive an immediate verified alert.</p>
        <a href="http://localhost:5173/dashboard" class="btn">View Exam Details →</a>
        """
        subject = f"✅ Tracking Activated for {exam_name} - ExamAlert AI"
        html = self._render_wrapper(subject, content)
        return self.send_email(to_email, subject, html)

    def send_exam_update_email(self, to_email: str, full_name: str, exam_name: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        title = analysis.get("title", f"{exam_name} Official Update")
        summary = analysis.get("summary", "")
        action = analysis.get("action_required", "Verify details on official website.")
        official_url = analysis.get("official_url", "https://nta.ac.in")
        reg_start = analysis.get("registration_start")
        reg_end = analysis.get("registration_end")
        exam_date = analysis.get("exam_date")
        event_type = analysis.get("event_type", "IMPORTANT_NOTICE")

        dates_html = ""
        if reg_start != "Not specified in the official notice." or reg_end != "Not specified in the official notice.":
            dates_html = f"<p><strong>📅 Official Registration Window:</strong> {reg_start} to {reg_end}</p>"
        elif exam_date != "Not specified in the official notice.":
            dates_html = f"<p><strong>📅 Official Exam Date:</strong> {exam_date}</p>"

        content = f"""
        <div class="badge badge-urgent">{event_type.replace('_', ' ')}</div>
        <h2>🚨 {exam_name} Official Notice</h2>
        <h3 style="color: #334155; margin-top: 4px;">{title}</h3>
        <p>{summary}</p>
        <div class="box">
          {dates_html}
          <p style="margin: 8px 0 0 0;"><strong>📝 Action Required:</strong> {action}</p>
        </div>
        <p style="font-size: 13px; color: #64748b;">⚠️ <em>ExamAlert AI Rule: Always verify announcements directly on the official testing agency portal.</em></p>
        <a href="{official_url}" target="_blank" class="btn">Visit Official Portal →</a>
        """
        subject = f"🚨 {exam_name} Alert: {title}"
        html = self._render_wrapper(subject, content)
        return self.send_email(to_email, subject, html)

    def send_deadline_reminder_email(self, to_email: str, full_name: str, exam_name: str, event_name: str, days_remaining: int, deadline_str: str, official_url: str) -> Dict[str, Any]:
        content = f"""
        <div class="badge badge-urgent">Deadline Reminder</div>
        <h2>⏰ {exam_name} {event_name} closes in {days_remaining} Day{'s' if days_remaining != 1 else ''}!</h2>
        <p>Dear {full_name}, this is an urgent reminder from ExamAlert AI.</p>
        <div class="box">
          <p style="margin: 0 0 6px 0;"><strong>Exam:</strong> {exam_name}</p>
          <p style="margin: 0 0 6px 0;"><strong>Event:</strong> {event_name}</p>
          <p style="margin: 0 0 6px 0; color: #dc2626;"><strong>Official Deadline:</strong> {deadline_str}</p>
          <p style="margin: 0;"><strong>Time Remaining:</strong> {days_remaining} day{'s' if days_remaining != 1 else ''}</p>
        </div>
        <p>Make sure to finalize and submit all forms and fee payments before the official portal closes.</p>
        <a href="{official_url}" target="_blank" class="btn">Go to Official Portal →</a>
        """
        subject = f"⏰ URGENT: {exam_name} {event_name} Closes in {days_remaining} Day{'s' if days_remaining != 1 else ''}"
        html = self._render_wrapper(subject, content)
        return self.send_email(to_email, subject, html)

email_service = EmailService()
