from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..dependencies import get_current_uid
from ..models import Event

router = APIRouter(prefix="/events", tags=["Events"])


def _serialize(e: Event) -> dict:
    return {
        "id": e.id,
        "title": e.title,
        "description": e.description,
        "category": e.category,
        "date": e.date,
        "time": e.time,
        "organizer": e.organizer,
        "areaId": e.area_id,
        "areaName": e.area_name,
        "featured": e.featured,
        "createdAt": e.created_at.isoformat(),
    }


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "General"
    date: Optional[str] = None
    time: Optional[str] = None
    organizer: Optional[str] = None
    area_id: Optional[str] = None
    area_name: Optional[str] = None
    featured: Optional[bool] = False


@router.get("", response_model=list)
async def list_events(
    area: Optional[str] = None,
    category: Optional[str] = None,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    q = select(Event).order_by(Event.created_at.desc())
    result = await db.execute(q)
    events = result.scalars().all()

    out = []
    for e in events:
        if area and area != "all" and e.area_id != area:
            continue
        if category and category != "All" and e.category != category:
            continue
        out.append(_serialize(e))
    return out


@router.post("", response_model=dict, status_code=201)
async def create_event(
    body: EventCreate,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    event = Event(**body.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return _serialize(event)
