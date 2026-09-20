import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    telegram_chat_id = Column(String(60), nullable=True)
    notify_email = Column(Boolean, default=True)
    notify_telegram = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("NotificationLog", back_populates="user", cascade="all, delete-orphan")

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(60), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    category = Column(String(60), nullable=False)  # Engineering, Medical, MBA, Government, University
    organizing_authority = Column(String(120), nullable=False)
    official_website = Column(String(255), nullable=False)
    official_application_url = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    subscriptions = relationship("Subscription", back_populates="exam", cascade="all, delete-orphan")
    sources = relationship("Source", back_populates="exam", cascade="all, delete-orphan")
    notices = relationship("Notice", back_populates="exam", cascade="all, delete-orphan")
    deadlines = relationship("Deadline", back_populates="exam", cascade="all, delete-orphan")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False, index=True)
    subscribed_at = Column(DateTime, default=datetime.datetime.utcnow)
    active = Column(Boolean, default=True)

    user = relationship("User", back_populates="subscriptions")
    exam = relationship("Exam", back_populates="subscriptions")

class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False, index=True)
    url = Column(String(255), nullable=False)
    name = Column(String(120), nullable=False)
    last_scraped_at = Column(DateTime, nullable=True)
    last_content_hash = Column(String(64), nullable=True)
    status = Column(String(30), default="active")

    exam = relationship("Exam", back_populates="sources")
    notices = relationship("Notice", back_populates="source")

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    raw_content = Column(Text, nullable=True)
    content_hash = Column(String(64), nullable=False, index=True)
    published_date = Column(String(80), nullable=True)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # AI Extracted Fields
    event_type = Column(String(60), default="IMPORTANT_NOTICE")  # REGISTRATION_OPEN, ADMIT_CARD, etc.
    importance = Column(String(20), default="high")  # high, medium, low
    summary = Column(Text, nullable=True)
    registration_start = Column(String(80), nullable=True)
    registration_end = Column(String(80), nullable=True)
    exam_date = Column(String(80), nullable=True)
    action_required = Column(Text, nullable=True)
    official_url = Column(String(255), nullable=False)
    is_official = Column(Boolean, default=True)
    
    # Additional structured metadata
    eligibility = Column(Text, nullable=True)
    fees = Column(String(120), nullable=True)
    documents = Column(Text, nullable=True)  # JSON or comma-separated string

    exam = relationship("Exam", back_populates="notices")
    source = relationship("Source", back_populates="notices")
    deadlines = relationship("Deadline", back_populates="notice")
    notifications = relationship("NotificationLog", back_populates="notice")

class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False, index=True)
    notice_id = Column(Integer, ForeignKey("notices.id"), nullable=True)
    event_name = Column(String(150), nullable=False)
    deadline_date = Column(DateTime, nullable=False)
    is_official = Column(Boolean, default=True)
    status = Column(String(30), default="upcoming")  # upcoming, urgent, closed
    reminder_7d_sent = Column(Boolean, default=False)
    reminder_3d_sent = Column(Boolean, default=False)
    reminder_1d_sent = Column(Boolean, default=False)

    exam = relationship("Exam", back_populates="deadlines")
    notice = relationship("Notice", back_populates="deadlines")

class NotificationLog(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False, index=True)
    notice_id = Column(Integer, ForeignKey("notices.id"), nullable=True, index=True)
    channel = Column(String(20), nullable=False)  # email, telegram
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(20), default="sent")  # sent, failed, simulated
    title = Column(String(255), nullable=False)
    message_preview = Column(Text, nullable=False)

    user = relationship("User", back_populates="notifications")
    notice = relationship("Notice", back_populates="notifications")
