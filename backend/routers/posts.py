import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..dependencies import get_current_uid
from ..models import Comment, Post, User

router = APIRouter(prefix="/posts", tags=["Feed Posts"])


def _serialize_comment(c: Comment) -> dict:
    return {
        "id": c.id,
        "text": c.text,
        "authorUid": c.author_uid,
        "author": c.author.name if c.author else "",
        "avatar": c.author.avatar if c.author else "",
        "createdAt": c.created_at.isoformat(),
    }


def _serialize(post: Post) -> dict:
    liked_by = json.loads(post.liked_by or "[]")
    saved_by = json.loads(post.saved_by or "[]")
    return {
        "id": post.id,
        "content": post.content,
        "image": post.image,
        "authorUid": post.author_uid,
        "author": post.author.name if post.author else "",
        "avatar": post.author.avatar if post.author else "",
        "likedBy": liked_by,
        "savedBy": saved_by,
        "likes": len(liked_by),
        "comments": [_serialize_comment(c) for c in (post.comments or [])],
        "createdAt": post.created_at.isoformat(),
    }


class PostCreate(BaseModel):
    content: str
    image: Optional[str] = None


class CommentCreate(BaseModel):
    text: str


# ── Routes ───────────────────────────────────
@router.get("", response_model=list)
async def list_posts(
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(Post)
        .options(
            selectinload(Post.author),
            selectinload(Post.comments).selectinload(Comment.author),
        )
        .order_by(Post.created_at.desc())
    )
    result = await db.execute(q)
    return [_serialize(p) for p in result.scalars().all()]


@router.post("", response_model=dict, status_code=201)
async def create_post(
    body: PostCreate,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    post = Post(content=body.content, image=body.image, author_uid=uid)
    db.add(post)
    await db.commit()
    await db.refresh(post)

    result = await db.execute(
        select(Post)
        .options(selectinload(Post.author), selectinload(Post.comments).selectinload(Comment.author))
        .where(Post.id == post.id)
    )
    return _serialize(result.scalar_one())


@router.post("/{post_id}/like", response_model=dict)
async def toggle_like(
    post_id: int,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Post)
        .options(selectinload(Post.author), selectinload(Post.comments).selectinload(Comment.author))
        .where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    liked_by = json.loads(post.liked_by or "[]")
    if uid in liked_by:
        liked_by.remove(uid)
    else:
        liked_by.append(uid)
    post.liked_by = json.dumps(liked_by)
    await db.commit()
    await db.refresh(post)
    return _serialize(post)


@router.post("/{post_id}/save", response_model=dict)
async def toggle_save(
    post_id: int,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Post)
        .options(selectinload(Post.author), selectinload(Post.comments).selectinload(Comment.author))
        .where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    saved_by = json.loads(post.saved_by or "[]")
    if uid in saved_by:
        saved_by.remove(uid)
    else:
        saved_by.append(uid)
    post.saved_by = json.dumps(saved_by)
    await db.commit()
    await db.refresh(post)
    return _serialize(post)


@router.post("/{post_id}/comment", response_model=dict)
async def add_comment(
    post_id: int,
    body: CommentCreate,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    comment = Comment(post_id=post_id, author_uid=uid, text=body.text)
    db.add(comment)
    await db.commit()

    result = await db.execute(
        select(Post)
        .options(selectinload(Post.author), selectinload(Post.comments).selectinload(Comment.author))
        .where(Post.id == post_id)
    )
    return _serialize(result.scalar_one())


@router.delete("/{post_id}", status_code=204)
async def delete_post(
    post_id: int,
    uid: str = Depends(get_current_uid),
    db: AsyncSession = Depends(get_db),
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    if post.author_uid != uid:
        raise HTTPException(status_code=403, detail="Only the author can delete this post.")
    await db.delete(post)
    await db.commit()
