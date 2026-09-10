from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()  # reads .env and sets all variables as environment variables

from app.routers import auth, items, recommendations
from app.database import Base, engine
from app.routers import search

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Shelf API",
    description="Smart film & book tracker with AI recommendations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(items.router, prefix="/items", tags=["Items"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(search.router, prefix="/search", tags=["Search"])

@app.get("/")
def root():
    return {"message": "Welcome to Shelf API!"}
