import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..dependencies import get_current_uid
from ..models import Idea, Notification, User

router = APIRouter(prefix="/ideas", tags=["Ideas"])


# ── Schemas ──────────────────────────────────
class PrivateDetails(BaseModel):
    problemStatement: Optional[str] = ""
    solution: Optional[str] = ""
    roadmap: Optional[list] = []
    resources: Optional[list] = []


class IdeaCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "General"
    stage: Optional[str] = "Idea"
    team_size: Optional[int] = 3
    team_requirement: Optional[str] = ""
    skills: Optional[list] = []
    private_details: Optional[PrivateDetails] = None


class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    stage: Optional[str] = None
    team_size: Optional[int] = None
    team_requirement: Optional[str] = None
    skills: Optional[list] = None
    private_details: Optional[PrivateDetails] = None


def _serialize(idea: Idea) -> dict:
    return {
        "id": idea.id,
        "title": idea.title,
        "description": idea.description,
        "category": idea.category,
        "stage": idea.stage,
        "teamSize": f"{idea.current_members}/{idea.team_size} members",
        "currentMembersCount": idea.current_members,
        "teamSizeLimit": idea.team_size,
        "teamRequirement": idea.team_requirement,
        "matchScore": f"{idea.match_score}%",
        "skills": json.loads(idea.skills or "[]"),
        "privateDetails": json.loads(idea.private_details or "{}"),
        "founderUid": idea.founder_uid,
        "founder": idea.founder.name if idea.founder else "",
        "founderAvatar": idea.founder.avatar if idea.founder else "",
        "founderEmail": idea.founder.email if idea.founder else "",
        "college": idea.founder.college if idea.founder else "",
        "reputation": idea.founder.reputation if idea.founder else 98,
        "createdAt": idea.created_at.isoformat(),
    }


# ── Routes ───────────────────────────────────
@router.get("", response_model=list)
async def list_ideas(
    category: Optional[str] = None,
    stage: Optional[str] = None,
    skill: Optional[str] = None,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    q = select(Idea).options(selectinload(Idea.founder)).order_by(Idea.created_at.desc())
    result = await db.execute(q)
    ideas = result.scalars().all()

    out = []
    for idea in ideas:
        if category and category != "All" and idea.category != category:
            continue
        if stage and stage != "All" and idea.stage != stage:
            continue
        if skill and skill != "All":
            skills_list = json.loads(idea.skills or "[]")
            if not any(s.lower() == skill.lower() for s in skills_list):
                continue
        out.append(_serialize(idea))
    return out


@router.post("", response_model=dict, status_code=201)
async def create_idea(
    body: IdeaCreate,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, uid)
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found. Complete onboarding.")

    idea = Idea(
        title=body.title,
        description=body.description,
        category=body.category,
        stage=body.stage,
        team_size=body.team_size,
        team_requirement=body.team_requirement,
        skills=json.dumps(body.skills or []),
        private_details=json.dumps(body.private_details.model_dump() if body.private_details else {}),
        founder_uid=uid,
        current_members=1,
        match_score=100,
    )
    db.add(idea)

    notif = Notification(
        user_uid=uid,
        content=f"You published a new idea: {body.title}",
        type="info",
    )
    db.add(notif)
    await db.commit()
    await db.refresh(idea)

    # reload with founder
    result = await db.execute(
        select(Idea).options(selectinload(Idea.founder)).where(Idea.id == idea.id)
    )
    idea = result.scalar_one()
    return _serialize(idea)


@router.patch("/{idea_id}", response_model=dict)
async def update_idea(
    idea_id: int,
    body: IdeaUpdate,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Idea).options(selectinload(Idea.founder)).where(Idea.id == idea_id)
    )
    idea = result.scalar_one_or_none()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found.")
    if idea.founder_uid != uid:
        raise HTTPException(status_code=403, detail="Only the founder can edit this idea.")

    data = body.model_dump(exclude_none=True)
    for k, v in data.items():
        if k == "skills":
            idea.skills = json.dumps(v)
        elif k == "private_details":
            idea.private_details = json.dumps(v.model_dump() if hasattr(v, "model_dump") else v)
        else:
            setattr(idea, k, v)

    await db.commit()
    await db.refresh(idea)
    return _serialize(idea)


@router.delete("/{idea_id}", status_code=204)
async def delete_idea(
    idea_id: int,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    idea = await db.get(Idea, idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found.")
    if idea.founder_uid != uid:
        raise HTTPException(status_code=403, detail="Only the founder can delete this idea.")
    await db.delete(idea)
    await db.commit()
