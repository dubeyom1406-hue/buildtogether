import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..dependencies import get_current_uid
from ..models import User

router = APIRouter(prefix="/users", tags=["Users"])


# ── Schemas ──────────────────────────────────
class UserOut(BaseModel):
    uid: str
    name: str
    email: str
    avatar: Optional[str] = None
    college: Optional[str] = None
    field: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    reputation: int = 0
    rating_sum: int = 0
    rating_count: int = 0
    rated_by: list = []
    onboarding_completed: bool = False
    skills: list = []
    experience: list = []
    certifications: list = []

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    college: Optional[str] = None
    field: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    onboarding_completed: Optional[bool] = None
    skills: Optional[list] = None
    experience: Optional[list] = None
    certifications: Optional[list] = None


def _serialize(user: User) -> dict:
    return {
        "uid": user.uid,
        "name": user.name,
        "email": user.email,
        "avatar": user.avatar,
        "college": user.college,
        "field": user.field,
        "role": user.role,
        "bio": user.bio,
        "github": user.github,
        "linkedin": user.linkedin,
        "portfolio": user.portfolio,
        "reputation": user.reputation or 0,
        "onboarding_completed": user.onboarding_completed,
        "skills": json.loads(user.skills or "[]"),
        "experience": json.loads(user.experience or "[]"),
        "certifications": json.loads(user.certifications or "[]"),
        "rating_sum": user.rating_sum or 0,
        "rating_count": user.rating_count or 0,
        "rated_by": json.loads(user.rated_by or "[]"),
    }


# ── Routes ───────────────────────────────────
@router.get("/me", response_model=dict)
async def get_me(uid: str = Depends(get_current_uid), db: AsyncSession = Depends(get_db)):
    user = await db.get(User, uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Complete onboarding first.")
    return _serialize(user)


@router.post("/me", response_model=dict, status_code=201)
async def create_or_update_me(
    body: UserUpdate,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    """Called after Firebase signup to create the DB record."""
    user = await db.get(User, uid)
    if not user:
        from firebase_admin import auth as fb_auth
        fb_user = fb_auth.get_user(uid)
        user = User(
            uid=uid,
            email=fb_user.email or "",
            name=body.name or fb_user.display_name or "",
            avatar=body.avatar or fb_user.photo_url,
        )
        db.add(user)

    data = body.model_dump(exclude_none=True)
    for k, v in data.items():
        if k in ("skills", "experience", "certifications"):
            setattr(user, k, json.dumps(v))
        else:
            setattr(user, k, v)

    await db.commit()
    await db.refresh(user)
    return _serialize(user)


@router.patch("/me", response_model=dict)
async def update_me(
    body: UserUpdate,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    data = body.model_dump(exclude_none=True)
    for k, v in data.items():
        if k in ("skills", "experience", "certifications"):
            setattr(user, k, json.dumps(v))
        else:
            setattr(user, k, v)
    await db.commit()
    await db.refresh(user)
    return _serialize(user)


@router.get("/{user_uid}", response_model=dict)
async def get_user(
    user_uid: str,
    _uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return _serialize(user)


@router.get("", response_model=list)
async def list_users(
    _uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    q = select(User).order_by(User.name.asc())
    result = await db.execute(q)
    users = result.scalars().all()
    return [_serialize(u) for u in users]


class RateBody(BaseModel):
    rating: int  # 1 to 5


@router.post("/{user_uid}/rate", response_model=dict)
async def rate_user(
    user_uid: str,
    body: RateBody,
    current_uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    if user_uid == current_uid:
        raise HTTPException(status_code=400, detail="You cannot rate yourself.")
    if body.rating < 1 or body.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")

    user = await db.get(User, user_uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    rated_by_list = []
    if user.rated_by:
        try:
            rated_by_list = json.loads(user.rated_by)
        except Exception:
            rated_by_list = []

    existing_rating = None
    for entry in rated_by_list:
        if isinstance(entry, dict) and entry.get("uid") == current_uid:
            existing_rating = entry
            break

    if existing_rating:
        old_val = existing_rating.get("rating", 0)
        existing_rating["rating"] = body.rating
        user.rating_sum = (user.rating_sum or 0) - old_val + body.rating
    else:
        rated_by_list.append({"uid": current_uid, "rating": body.rating})
        user.rating_sum = (user.rating_sum or 0) + body.rating
        user.rating_count = (user.rating_count or 0) + 1

    user.rated_by = json.dumps(rated_by_list)

    if user.rating_count > 0:
        user.reputation = int((user.rating_sum / (user.rating_count * 5)) * 100)
    else:
        user.reputation = 0

    await db.commit()
    await db.refresh(user)
    return _serialize(user)
