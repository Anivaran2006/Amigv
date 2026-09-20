import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Exam, Subscription, Notice, Deadline, User
from app.schemas.schemas import ExamOut, NoticeOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/exams", tags=["Exams"])

def get_optional_current_user(db: Session = Depends(get_db)) -> Optional[User]:
    # Allows both public and authenticated queries
    return None

@router.get("", response_model=List[ExamOut])
def list_exams(
    category: Optional[str] = None,
    search: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Exam).filter(Exam.active == True)
    if category and category != "All":
        query = query.filter(Exam.category == category)
    if search:
        query = query.filter(
            (Exam.name.ilike(f"%{search}%")) |
            (Exam.organizing_authority.ilike(f"%{search}%")) |
            (Exam.description.ilike(f"%{search}%"))
        )

    exams = query.all()
    user_sub_ids = set()
    if user_id:
        subs = db.query(Subscription).filter_by(user_id=user_id, active=True).all()
        user_sub_ids = {s.exam_id for s in subs}

    now = datetime.datetime.utcnow()
    result = []
    for ex in exams:
        # Latest notice
        latest_notice = db.query(Notice).filter_by(exam_id=ex.id).order_by(Notice.detected_at.desc()).first()
        # Next deadline
        next_deadline = db.query(Deadline).filter(
            Deadline.exam_id == ex.id,
            Deadline.deadline_date > now
        ).order_by(Deadline.deadline_date.asc()).first()

        days_remaining = None
        deadline_str = None
        if next_deadline:
            days_remaining = (next_deadline.deadline_date - now).days
            deadline_str = f"{next_deadline.event_name} ({next_deadline.deadline_date.strftime('%d %b %Y')})"

        item = ExamOut(
            id=ex.id,
            slug=ex.slug,
            name=ex.name,
            category=ex.category,
            organizing_authority=ex.organizing_authority,
            official_website=ex.official_website,
            official_application_url=ex.official_application_url,
            description=ex.description,
            active=ex.active,
            is_subscribed=(ex.id in user_sub_ids),
            latest_notice_title=latest_notice.title if latest_notice else None,
            latest_notice_date=latest_notice.published_date if latest_notice else None,
            upcoming_deadline=deadline_str,
            days_remaining=days_remaining
        )
        result.append(item)
    return result

@router.get("/my-exams", response_model=List[ExamOut])
def get_my_exams(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subs = db.query(Subscription).filter_by(user_id=current_user.id, active=True).all()
    sub_exam_ids = [s.exam_id for s in subs]
    
    exams = db.query(Exam).filter(Exam.id.in_(sub_exam_ids)).all() if sub_exam_ids else []
    now = datetime.datetime.utcnow()
    result = []
    for ex in exams:
        latest_notice = db.query(Notice).filter_by(exam_id=ex.id).order_by(Notice.detected_at.desc()).first()
        next_deadline = db.query(Deadline).filter(
            Deadline.exam_id == ex.id,
            Deadline.deadline_date > now
        ).order_by(Deadline.deadline_date.asc()).first()

        days_remaining = None
        deadline_str = None
        if next_deadline:
            days_remaining = (next_deadline.deadline_date - now).days
            deadline_str = f"{next_deadline.event_name} ({next_deadline.deadline_date.strftime('%d %b %Y')})"

        result.append(ExamOut(
            id=ex.id,
            slug=ex.slug,
            name=ex.name,
            category=ex.category,
            organizing_authority=ex.organizing_authority,
            official_website=ex.official_website,
            official_application_url=ex.official_application_url,
            description=ex.description,
            active=ex.active,
            is_subscribed=True,
            latest_notice_title=latest_notice.title if latest_notice else None,
            latest_notice_date=latest_notice.published_date if latest_notice else None,
            upcoming_deadline=deadline_str,
            days_remaining=days_remaining
        ))
    return result

@router.get("/{exam_id}")
def get_exam_detail(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    notices = db.query(Notice).filter_by(exam_id=exam.id).order_by(Notice.detected_at.desc()).all()
    deadlines = db.query(Deadline).filter_by(exam_id=exam.id).order_by(Deadline.deadline_date.asc()).all()

    # Build timeline stages according to Section 16:
    # Registration Open, Registration Deadline, Admit Card, Examination, Answer Key, Result
    timeline_stages = [
        {
            "stage": "Registration Open",
            "status": "announced" if any(n.event_type == "REGISTRATION_OPEN" for n in notices) else "not_announced",
            "date": next((n.registration_start for n in notices if n.registration_start and n.registration_start != "Not specified in the official notice."), "Not announced")
        },
        {
            "stage": "Registration Deadline",
            "status": "announced" if any(n.registration_end and n.registration_end != "Not specified in the official notice." for n in notices) else "not_announced",
            "date": next((n.registration_end for n in notices if n.registration_end and n.registration_end != "Not specified in the official notice."), "Not announced")
        },
        {
            "stage": "Application Correction",
            "status": "announced" if any(n.event_type == "APPLICATION_CORRECTION" for n in notices) else "not_announced",
            "date": "Announced via Portal" if any(n.event_type == "APPLICATION_CORRECTION" for n in notices) else "Not announced"
        },
        {
            "stage": "Admit Card",
            "status": "announced" if any(n.event_type == "ADMIT_CARD" for n in notices) else "not_announced",
            "date": "Available on Portal" if any(n.event_type == "ADMIT_CARD" for n in notices) else "Not announced"
        },
        {
            "stage": "Examination",
            "status": "announced" if any(n.exam_date and n.exam_date != "Not specified in the official notice." for n in notices) else "not_announced",
            "date": next((n.exam_date for n in notices if n.exam_date and n.exam_date != "Not specified in the official notice."), "Not announced")
        },
        {
            "stage": "Answer Key",
            "status": "announced" if any(n.event_type == "ANSWER_KEY" for n in notices) else "not_announced",
            "date": "Released" if any(n.event_type == "ANSWER_KEY" for n in notices) else "Not announced"
        },
        {
            "stage": "Result / Rank Card",
            "status": "announced" if any(n.event_type == "RESULT" for n in notices) else "not_announced",
            "date": "Published" if any(n.event_type == "RESULT" for n in notices) else "Not announced"
        }
    ]

    return {
        "exam": exam,
        "timeline": timeline_stages,
        "notices": notices,
        "deadlines": deadlines
    }
