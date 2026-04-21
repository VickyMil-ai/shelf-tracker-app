from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[schemas.ItemOut])
def get_items(
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Item).filter(models.Item.user_id == current_user.id)
    if type:
        query = query.filter(models.Item.type == type)
    if status:
        query = query.filter(models.Item.status == status)
    return query.all()


@router.post("/", response_model=schemas.ItemOut, status_code=201)
def create_item(
    item: schemas.ItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check for duplicate title + type combo for this user
    existing = db.query(models.Item).filter(
        models.Item.user_id == current_user.id,
        models.Item.title.ilike(item.title),  # ilike = case-insensitive
        models.Item.type == item.type
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"You already have a {item.type.value} titled '{item.title}' in your shelf"
        )
        
    new_item = models.Item(**item.dict(), user_id=current_user.id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.put("/{item_id}", response_model=schemas.ItemOut)
def update_item(
    item_id: int,
    updates: schemas.ItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = db.query(models.Item).filter(
        models.Item.id == item_id,
        models.Item.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for key, value in updates.dict(exclude_unset=True).items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = db.query(models.Item).filter(
        models.Item.id == item_id,
        models.Item.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
