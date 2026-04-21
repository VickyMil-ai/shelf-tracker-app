from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.database import get_db
from app import models
from app.routers.auth import get_current_user
from app.embeddings import index_user_items, get_similar_items, build_item_text
from collections import Counter

router = APIRouter()

recommendation_prompt = PromptTemplate(
    input_variables=["liked_items", "similar_items", "top_genres"],
    template="""
You are a thoughtful film and book recommender.

The user's favourite genres in order of preference are: {top_genres}

The user has highly rated these items:
{liked_items}

Based on their taste, here are some potentially similar items found:
{similar_items}

Suggest 3 films or books the user would enjoy, prioritizing those that match their favourite genres.
For each one:
- Give the title
- Say what type it is (film or book)
- Give a 1-2 sentence reason why it matches their taste and preferred genres

Be specific and personal in your reasoning. Do not recommend items the user has already rated.
"""
)

@router.get("/")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get the user's highly rated items
    liked_items = db.query(models.Item).filter(
        models.Item.user_id == current_user.id,
        models.Item.rating >= 4.0
    ).all()

    if not liked_items:
        raise HTTPException(
            status_code=400,
            detail="Rate at least one item 4 stars or higher to get recommendations!"
        )

    # Index items into vector store
    index_user_items(current_user.id, db)
    
    # Group by genre and weight by rating
    genre_counts = Counter()
    for item in liked_items:
        if item.genre:
            weight = 2 if item.rating >= 4.5 else 1  # highly rated items count double
            genre_counts[item.genre.lower()] += weight

    # Sort genres by frequency
    top_genres = [genre for genre, count in genre_counts.most_common()]

    # Build weighted liked texts (5-star items appear twice for stronger signal)
    liked_texts = []
    for item in liked_items:
        text = build_item_text(item)
        liked_texts.append(text)
        if item.rating >= 4.5:
            liked_texts.append(text)  # duplicate for extra weight in embedding

    taste_query = " ".join(liked_texts)

    # Add genre preference to the prompt context
    genre_summary = ", ".join(top_genres) if top_genres else "varied"

    # Find similar items from vector store
    similar = get_similar_items(taste_query, current_user.id)
    similar_texts = "\n".join([doc.page_content for doc in similar]) if similar else "None found yet"

    # Generate recommendations with LLM
    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
    chain = recommendation_prompt | llm

    result = chain.invoke({
        "liked_items": "\n".join(liked_texts),
        "similar_items": similar_texts,
        "top_genres": genre_summary
    })

    return {
        "based_on": [item.title for item in liked_items],
        "recommendations": result.content
    }
