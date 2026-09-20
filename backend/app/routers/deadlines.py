import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Deadline, Exam, Subscription, User
from app.schemas.schemas import DeadlineOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/deadlines", tags=["Deadlines"])

@router.get("", response_model=List[DeadlineOut])
def get_deadlines(
    user_id: Optional[int] = None,
    all_exams: bool = False,
    db: Session = Depends(get_db)
):
    now = datetime.datetime.utcnow()
    query = db.query(Deadline, Exam.name.label("exam_name")).join(Exam, Deadline.exam_id == Exam.id).filter(
        Deadline.deadline_date > now
    )

    if not all_exams and user_id:
        sub_exam_ids = [s.exam_id for s in db.query(Subscription).filter_by(user_id=user_id, active=True).all()]
        query = query.filter(Deadline.exam_id.in_(sub_exam_ids))

    rows = query.order_by(Deadline.deadline_date.asc()).all()

    result = []
    for deadline, exam_name in rows:
        diff = deadline.deadline_date - now
        days = max(0, diff.days)
        status = "urgent" if days <= 3 else ("due_soon" if days <= 7 else "upcoming")
        
        result.append(DeadlineOut(
            id=deadline.id,
            exam_id=deadline.exam_id,
            exam_name=exam_name,
            event_name=deadline.event_name,
            deadline_date=deadline.deadline_date,
            days_remaining=days,
            is_official=deadline.is_official,
            status=status
        ))
    return result
