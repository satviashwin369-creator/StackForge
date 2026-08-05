from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserRegister


class AuthService:
    @staticmethod
    def register(db: Session, payload: UserRegister) -> User:
        existing = db.scalar(select(User).where(User.email == payload.email))
        if existing:
            raise ValueError("Email already registered")
        user = User(
            email=payload.email.lower(),
            hashed_password=hash_password(payload.password),
            full_name=payload.full_name,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> User | None:
        user = db.scalar(select(User).where(User.email == email.lower()))
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def issue_token(user: User) -> str:
        return create_access_token(str(user.id))
