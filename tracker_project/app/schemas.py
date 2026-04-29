from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from enum import Enum

class ItemType(str, Enum):
    film = "film"
    book = "book"

# --- Auth Schemas ---
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Item Schemas ---
class ItemCreate(BaseModel):
    title: str
    type: ItemType
    genre: Optional[str] = None
    rating: Optional[float] = None   # 1.0 - 5.0
    notes: Optional[str] = None
    status: Optional[str] = "watched"
    
    @field_validator("status")
    def status_matches_type(cls, v, info):
        type_ = info.data.get("type")
        film_statuses = {"watched", "plan_to_watch"}
        book_statuses = {"read", "plan_to_read", "reading"}

        if type_ == "film" and v in book_statuses:
            raise ValueError("Films can only have status: watched, plan_to_watch")
        if type_ == "book" and v in film_statuses:
            raise ValueError("Books can only have status: read, plan_to_read, reading")
        return v

    @field_validator("rating")
    def rating_range(cls, v):
        if v is not None and not (0.0 <= v <= 5.0):
            raise ValueError("Rating must be between 0 and 5")
        return v

class ItemUpdate(BaseModel):
    title: Optional[str] = None
    genre: Optional[str] = None
    rating: Optional[float] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class ItemOut(BaseModel):
    id: int
    title: str
    type: ItemType
    genre: Optional[str]
    rating: Optional[float]
    notes: Optional[str]
    status: str

    class Config:
        from_attributes = True
