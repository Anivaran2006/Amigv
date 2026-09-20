from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
import datetime

# --- User & Auth Schemas ---

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    notify_email: bool = True
    notify_telegram: bool = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    notify_email: bool
    notify_telegram: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    notify_email: Optional[bool] = None
    notify_telegram: Optional[bool] = None

# --- Exam Schemas ---

class ExamBase(BaseModel):
    id: int
    slug: str
    name: str
    category: str
    organizing_authority: str
    official_website: str
    official_application_url: Optional[str] = None
    description: Optional[str] = None
    active: bool

    class Config:
        from_attributes = True

class ExamOut(ExamBase):
    is_subscribed: bool = False
    latest_notice_title: Optional[str] = None
    latest_notice_date: Optional[str] = None
    upcoming_deadline: Optional[str] = None
    days_remaining: Optional[int] = None

# --- Notice Schemas ---

class NoticeOut(BaseModel):
    id: int
    exam_id: int
    exam_name: Optional[str] = None
    title: str
    raw_content: Optional[str] = None
    published_date: Optional[str] = None
    detected_at: datetime.datetime
    event_type: str
    importance: str
    summary: Optional[str] = None
    registration_start: Optional[str] = None
    registration_end: Optional[str] = None
    exam_date: Optional[str] = None
    action_required: Optional[str] = None
    official_url: str
    is_official: bool
    eligibility: Optional[str] = None
    fees: Optional[str] = None
    documents: Optional[str] = None

    class Config:
        from_attributes = True

# --- Deadline Schemas ---

class DeadlineOut(BaseModel):
    id: int
    exam_id: int
    exam_name: str
    event_name: str
    deadline_date: datetime.datetime
    days_remaining: int
    is_official: bool
    status: str

    class Config:
        from_attributes = True

# --- Notification Schemas ---

class NotificationOut(BaseModel):
    id: int
    user_id: int
    exam_id: int
    exam_name: Optional[str] = None
    notice_id: Optional[int] = None
    channel: str
    sent_at: datetime.datetime
    status: str
    title: str
    message_preview: str

    class Config:
        from_attributes = True

# --- Subscription Schemas ---

class SubscriptionToggle(BaseModel):
    exam_id: int

# --- AI Assistant Schemas ---

class AIChatRequest(BaseModel):
    question: str

class AIChatResponse(BaseModel):
    answer: str
    sources: List[str] = []
    suggested_actions: List[str] = []

# --- Demo Simulation Schemas ---

class DemoSimulateRequest(BaseModel):
    exam_id: int
    notice_title: str
    notice_content: str
    official_url: Optional[str] = None
    event_type: Optional[str] = None
    published_date: Optional[str] = None

class DemoSimulateResponse(BaseModel):
    success: bool
    message: str
    notice_id: int
    analysis: dict
    duplicate_prevented: bool = False
    notifications_sent: List[dict] = []
