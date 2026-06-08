import json
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey,
    Integer, String, Text,
)
from sqlalchemy.orm import relationship

from .database import Base


def _now():
    return datetime.now(timezone.utc)


# ──────────────────────────────────────────────
# USER
# ──────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    uid                  = Column(String,  primary_key=True)
    name                 = Column(String,  default="")
    email                = Column(String,  unique=True, index=True, nullable=False)
    avatar               = Column(String,  nullable=True)
    college              = Column(String,  nullable=True)
    field                = Column(String,  nullable=True)
    role                 = Column(String,  nullable=True)
    bio                  = Column(Text,    nullable=True)
    github               = Column(String,  nullable=True)
    linkedin             = Column(String,  nullable=True)
    portfolio            = Column(String,  nullable=True)
    reputation           = Column(Integer, default=0)
    rating_sum           = Column(Integer, default=0)
    rating_count         = Column(Integer, default=0)
    rated_by             = Column(Text,    default="[]")
    onboarding_completed = Column(Boolean, default=False)
    skills               = Column(Text,    default="[]")
    experience           = Column(Text,    default="[]")
    certifications       = Column(Text,    default="[]")
    created_at           = Column(DateTime(timezone=True), default=_now)

    ideas         = relationship("Idea",        back_populates="founder",   cascade="all, delete-orphan")
    posts         = relationship("Post",        back_populates="author",    cascade="all, delete-orphan")
    notifications = relationship("Notification",back_populates="user",      cascade="all, delete-orphan")
    sent_requests = relationship("JoinRequest", back_populates="applicant", cascade="all, delete-orphan")


# ──────────────────────────────────────────────
# IDEA
# ──────────────────────────────────────────────
class Idea(Base):
    __tablename__ = "ideas"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    title           = Column(String,  nullable=False)
    description     = Column(Text,    nullable=True)
    category        = Column(String,  nullable=True)
    stage           = Column(String,  default="Idea")
    team_size       = Column(Integer, default=3)
    current_members = Column(Integer, default=1)
    team_requirement= Column(Text,    nullable=True)
    match_score     = Column(Integer, default=100)
    skills          = Column(Text,    default="[]")
    private_details = Column(Text,    default="{}")
    founder_uid     = Column(String,  ForeignKey("users.uid"), nullable=False)
    created_at      = Column(DateTime(timezone=True), default=_now)

    founder       = relationship("User",        back_populates="ideas")
    join_requests = relationship("JoinRequest", back_populates="idea", cascade="all, delete-orphan")


# ──────────────────────────────────────────────
# JOIN REQUEST
# ──────────────────────────────────────────────
class JoinRequest(Base):
    __tablename__ = "join_requests"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    idea_id       = Column(Integer, ForeignKey("ideas.id"),  nullable=False)
    applicant_uid = Column(String,  ForeignKey("users.uid"), nullable=False)
    cover_notes   = Column(Text,    nullable=True)
    status        = Column(String,  default="pending")
    created_at    = Column(DateTime(timezone=True), default=_now)

    idea      = relationship("Idea", back_populates="join_requests")
    applicant = relationship("User", back_populates="sent_requests")


# ──────────────────────────────────────────────
# POST (Feed)
# ──────────────────────────────────────────────
class Post(Base):
    __tablename__ = "posts"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    content    = Column(Text,    nullable=False)
    image      = Column(String,  nullable=True)
    author_uid = Column(String,  ForeignKey("users.uid"), nullable=False)
    liked_by   = Column(Text,    default="[]")
    saved_by   = Column(Text,    default="[]")
    created_at = Column(DateTime(timezone=True), default=_now)

    author   = relationship("User",    back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")


# ──────────────────────────────────────────────
# COMMENT
# ──────────────────────────────────────────────
class Comment(Base):
    __tablename__ = "comments"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    post_id    = Column(Integer, ForeignKey("posts.id"),   nullable=False)
    author_uid = Column(String,  ForeignKey("users.uid"),  nullable=False)
    text       = Column(Text,    nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now)

    post   = relationship("Post", back_populates="comments")
    author = relationship("User")


# ──────────────────────────────────────────────
# NOTIFICATION
# ──────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    user_uid   = Column(String,  ForeignKey("users.uid"), nullable=False)
    content    = Column(Text,    nullable=False)
    type       = Column(String,  default="info")
    read       = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=_now)

    user = relationship("User", back_populates="notifications")


# ──────────────────────────────────────────────
# EVENT
# ──────────────────────────────────────────────
class Event(Base):
    __tablename__ = "events"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    title       = Column(String,  nullable=False)
    description = Column(Text,    nullable=True)
    category    = Column(String,  nullable=True)
    date        = Column(String,  nullable=True)
    time        = Column(String,  nullable=True)
    organizer   = Column(String,  nullable=True)
    area_id     = Column(String,  nullable=True)
    area_name   = Column(String,  nullable=True)
    featured    = Column(Boolean, default=False)
    created_at  = Column(DateTime(timezone=True), default=_now)


# ──────────────────────────────────────────────
# MESSAGE
# ──────────────────────────────────────────────
class Message(Base):
    __tablename__ = "messages"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    sender_uid   = Column(String,  ForeignKey("users.uid"), nullable=False)
    receiver_uid = Column(String,  ForeignKey("users.uid"), nullable=False)
    text         = Column(Text,    nullable=False)
    read         = Column(Boolean, default=False)
    created_at   = Column(DateTime(timezone=True), default=_now)

    sender   = relationship("User", foreign_keys=[sender_uid])
    receiver = relationship("User", foreign_keys=[receiver_uid])
