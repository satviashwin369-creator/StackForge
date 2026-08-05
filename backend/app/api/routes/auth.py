from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.auth import TokenResponse, UserLogin, UserRead, UserRegister
from app.schemas.common import ApiResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=ApiResponse[TokenResponse])
def register(payload: UserRegister, db: DbSession):
    try:
        user = AuthService.register(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    token = AuthService.issue_token(user)
    return ApiResponse(
        data=TokenResponse(access_token=token),
        meta={"user_id": str(user.id)},
    )


@router.post("/login", response_model=ApiResponse[TokenResponse])
def login(payload: UserLogin, db: DbSession):
    user = AuthService.authenticate(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return ApiResponse(data=TokenResponse(access_token=AuthService.issue_token(user)))


@router.get("/me", response_model=ApiResponse[UserRead])
def me(current_user: CurrentUser):
    return ApiResponse(data=UserRead.model_validate(current_user))
