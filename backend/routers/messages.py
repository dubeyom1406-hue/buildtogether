from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..dependencies import get_current_uid
from ..models import Message, User

router = APIRouter(prefix="/messages", tags=["Messages"])


def _serialize(m: Message) -> dict:
    return {
        "id": m.id,
        "senderUid": m.sender_uid,
        "senderName": m.sender.name if m.sender else "",
        "senderAvatar": m.sender.avatar if m.sender else "",
        "receiverUid": m.receiver_uid,
        "text": m.text,
        "read": m.read,
        "createdAt": m.created_at.isoformat(),
    }


class MessageCreate(BaseModel):
    receiver_uid: str
    text: str


@router.get("", response_model=list)
async def list_messages(
    with_uid: Optional[str] = None,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    """List all messages for current user. Optionally filter by conversation partner."""
    q = (
        select(Message)
        .options(selectinload(Message.sender), selectinload(Message.receiver))
        .where(or_(Message.sender_uid == uid, Message.receiver_uid == uid))
        .order_by(Message.created_at.asc())
    )
    result = await db.execute(q)
    messages = result.scalars().all()

    if with_uid:
        messages = [
            m for m in messages
            if (m.sender_uid == with_uid or m.receiver_uid == with_uid)
        ]
    return [_serialize(m) for m in messages]


@router.post("", response_model=dict, status_code=201)
async def send_message(
    body: MessageCreate,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    msg = Message(sender_uid=uid, receiver_uid=body.receiver_uid, text=body.text)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    result = await db.execute(
        select(Message)
        .options(selectinload(Message.sender), selectinload(Message.receiver))
        .where(Message.id == msg.id)
    )
    return _serialize(result.scalar_one())


@router.get("/contacts", response_model=list)
async def list_contacts(
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    """Return list of users this user has messaged with."""
    q = (
        select(Message)
        .options(selectinload(Message.sender), selectinload(Message.receiver))
        .where(or_(Message.sender_uid == uid, Message.receiver_uid == uid))
        .order_by(Message.created_at.desc())
    )
    result = await db.execute(q)
    messages = result.scalars().all()

    seen = set()
    contacts = []
    for m in messages:
        other_uid = m.receiver_uid if m.sender_uid == uid else m.sender_uid
        if other_uid not in seen:
            seen.add(other_uid)
            other = m.receiver if m.sender_uid == uid else m.sender
            contacts.append({
                "uid": other_uid,
                "name": other.name if other else "",
                "avatar": other.avatar if other else "",
                "lastMessage": m.text,
                "lastMessageTime": m.created_at.isoformat(),
            })
    return contacts
