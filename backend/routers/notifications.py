from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..dependencies import get_current_uid
from ..models import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _serialize(n: Notification) -> dict:
    return {
        "id": n.id,
        "content": n.content,
        "type": n.type,
        "read": n.read,
        "createdAt": n.created_at.isoformat(),
    }


@router.get("", response_model=list)
async def list_notifications(
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    q = select(Notification).where(Notification.user_uid == uid).order_by(Notification.created_at.desc())
    result = await db.execute(q)
    return [_serialize(n) for n in result.scalars().all()]


@router.patch("/{notif_id}/read", response_model=dict)
async def mark_read(
    notif_id: int,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException
    notif = await db.get(Notification, notif_id)
    if not notif or notif.user_uid != uid:
        raise HTTPException(status_code=404, detail="Notification not found.")
    notif.read = True
    await db.commit()
    await db.refresh(notif)
    return _serialize(notif)


@router.patch("/read-all", response_model=dict)
async def mark_all_read(
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    q = select(Notification).where(Notification.user_uid == uid, Notification.read == False)
    result = await db.execute(q)
    for n in result.scalars().all():
        n.read = True
    await db.commit()
    return {"message": "All notifications marked as read."}
