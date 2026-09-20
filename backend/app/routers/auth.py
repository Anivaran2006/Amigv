import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import hashlib
from jose import JWTError, jwt
from app.database import get_db
from app.config import settings
from app.models.models import User, NotificationLog
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserOut, UserProfileUpdate
from app.services.telegram_service import telegram_service
from app.services.email_service import email_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

def hash_password(password: str) -> str:
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), b'examalert_salt_2026', 100000).hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed_pw = hash_password(user_in.password)
    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=hashed_pw,
        phone=user_in.phone,
        telegram_chat_id=user_in.telegram_chat_id,
        notify_email=user_in.notify_email,
        notify_telegram=user_in.notify_telegram
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Immediately send Welcome notifications
    if user.notify_telegram and user.telegram_chat_id:
        tg_res = telegram_service.send_welcome_message(user.telegram_chat_id, user.full_name)
        db.add(NotificationLog(
            user_id=user.id,
            exam_id=1,
            channel="telegram",
            title="👋 Welcome to ExamAlert AI",
            message_preview="Your account has been created. You can now track important competitive exam updates.",
            status="sent"
        ))

    if user.notify_email and user.email:
        email_service.send_welcome_email(user.email, user.full_name)
        db.add(NotificationLog(
            user_id=user.id,
            exam_id=1,
            channel="email",
            title="👋 Welcome to ExamAlert AI",
            message_preview="Welcome email sent with dashboard access and getting started instructions.",
            status="sent"
        ))

    db.commit()

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=user)

@router.post("/login", response_model=TokenResponse)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=user)

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(updates: UserProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if updates.full_name is not None:
        current_user.full_name = updates.full_name
    if updates.phone is not None:
        current_user.phone = updates.phone
    if updates.telegram_chat_id is not None:
        current_user.telegram_chat_id = updates.telegram_chat_id
    if updates.notify_email is not None:
        current_user.notify_email = updates.notify_email
    if updates.notify_telegram is not None:
        current_user.notify_telegram = updates.notify_telegram

    db.commit()
    db.refresh(current_user)
    return current_user
