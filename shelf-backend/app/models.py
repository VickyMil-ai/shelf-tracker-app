from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class ItemType(str, enum.Enum):
    film = "film"
    book = "book"
    
class StatusType(str, enum.Enum):
    watched = "watched"
    read = "read"
    reading = "reading"
    plan_to_watch = "plan_to_watch"
    plan_to_read = "plan_to_read"
    

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("Item", back_populates="owner")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(Enum(ItemType), nullable=False)       # "film" or "book"
    genre = Column(String, nullable=True)
    rating = Column(Float, nullable=True)   # 1.0 - 5.0
    notes = Column(String, nullable=True)
    status = Column(Enum(StatusType), default=StatusType.watched)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="items")
