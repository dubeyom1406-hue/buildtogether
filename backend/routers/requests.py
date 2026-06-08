from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..dependencies import get_current_uid
from ..models import Idea, JoinRequest, Notification, User

router = APIRouter(prefix="/requests", tags=["Join Requests"])


def _serialize(req: JoinRequest) -> dict:
    return {
        "id": req.id,
        "ideaId": req.idea_id,
        "ideaTitle": req.idea.title if req.idea else "",
        "founderUid": req.idea.founder_uid if req.idea else "",
        "applicantUid": req.applicant_uid,
        "applicantName": req.applicant.name if req.applicant else "",
        "applicantAvatar": req.applicant.avatar if req.applicant else "",
        "applicantEmail": req.applicant.email if req.applicant else "",
        "coverNotes": req.cover_notes,
        "status": req.status,
        "createdAt": req.created_at.isoformat(),
    }


class RequestCreate(BaseModel):
    idea_id: int
    cover_notes: Optional[str] = ""


# ── Routes ───────────────────────────────────
@router.get("", response_model=list)
async def list_requests(
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    """Return requests where current user is applicant OR idea founder."""
    q = (
        select(JoinRequest)
        .options(
            selectinload(JoinRequest.idea).selectinload(Idea.founder),
            selectinload(JoinRequest.applicant),
        )
        .order_by(JoinRequest.created_at.desc())
    )
    result = await db.execute(q)
    all_reqs = result.scalars().all()

    out = []
    for r in all_reqs:
        is_applicant = r.applicant_uid == uid
        is_founder = r.idea and r.idea.founder_uid == uid
        if is_applicant or is_founder:
            out.append(_serialize(r))
    return out


@router.post("", response_model=dict, status_code=201)
async def create_request(
    body: RequestCreate,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    # Check idea exists
    result = await db.execute(
        select(Idea).options(selectinload(Idea.founder)).where(Idea.id == body.idea_id)
    )
    idea = result.scalar_one_or_none()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found.")
    if idea.founder_uid == uid:
        raise HTTPException(status_code=400, detail="You cannot apply to your own idea.")

    # Check duplicate
    dup = await db.execute(
        select(JoinRequest).where(
            JoinRequest.idea_id == body.idea_id,
            JoinRequest.applicant_uid == uid,
        )
    )
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You already applied to this idea.")

    req = JoinRequest(
        idea_id=body.idea_id,
        applicant_uid=uid,
        cover_notes=body.cover_notes,
        status="pending",
    )
    db.add(req)

    # Notify founder
    notif = Notification(
        user_uid=idea.founder_uid,
        content=f"Someone applied to join your project: {idea.title}",
        type="request",
    )
    db.add(notif)
    await db.commit()
    await db.refresh(req)

    result2 = await db.execute(
        select(JoinRequest)
        .options(
            selectinload(JoinRequest.idea).selectinload(Idea.founder),
            selectinload(JoinRequest.applicant),
        )
        .where(JoinRequest.id == req.id)
    )
    return _serialize(result2.scalar_one())


@router.patch("/{req_id}/accept", response_model=dict)
async def accept_request(
    req_id: int,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(JoinRequest)
        .options(
            selectinload(JoinRequest.idea).selectinload(Idea.founder),
            selectinload(JoinRequest.applicant),
        )
        .where(JoinRequest.id == req_id)
    )
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    if req.idea.founder_uid != uid:
        raise HTTPException(status_code=403, detail="Only the idea founder can accept requests.")

    req.status = "accepted"
    notif = Notification(
        user_uid=req.applicant_uid,
        content=f'Your request to join "{req.idea.title}" has been accepted!',
        type="info",
    )
    db.add(notif)
    await db.commit()
    await db.refresh(req)
    return _serialize(req)


@router.patch("/{req_id}/reject", response_model=dict)
async def reject_request(
    req_id: int,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(JoinRequest)
        .options(
            selectinload(JoinRequest.idea).selectinload(Idea.founder),
            selectinload(JoinRequest.applicant),
        )
        .where(JoinRequest.id == req_id)
    )
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    if req.idea.founder_uid != uid:
        raise HTTPException(status_code=403, detail="Only the idea founder can reject requests.")

    req.status = "rejected"
    notif = Notification(
        user_uid=req.applicant_uid,
        content=f'Your request to join "{req.idea.title}" was rejected.',
        type="info",
    )
    db.add(notif)
    await db.commit()
    await db.refresh(req)
    return _serialize(req)
