from langchain_openai import OpenAIEmbeddings
from langchain_postgres import PGVectorStore
from sqlalchemy.orm import Session
from app import models
import os

COLLECTION_NAME = "shelf_items"
CONNECTION_STRING = os.getenv("DATABASE_URL")

def get_vector_store():
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    return PGVector(
        collection_name=COLLECTION_NAME,
        connection_string=CONNECTION_STRING,
        embedding_function=embeddings,
    )

def build_item_text(item: models.Item) -> str:
    """Convert an item into a descriptive string for embedding."""
    parts = [f"{item.type.value} titled '{item.title}'"]
    if item.genre:
        parts.append(f"genre: {item.genre}")
    if item.rating:
        parts.append(f"rated {item.rating}/5")
    if item.notes:
        parts.append(f"notes: {item.notes}")
    return ", ".join(parts)

def index_user_items(user_id: int, db: Session):
    """Embed and store all of a user's highly rated items."""
    items = db.query(models.Item).filter(
        models.Item.user_id == user_id,
        models.Item.rating >= 4.0
    ).all()

    if not items:
        return False

    texts = [build_item_text(item) for item in items]
    metadatas = [{"title": item.title, "type": item.type.value, "user_id": user_id} for item in items]

    store = get_vector_store()
    store.add_texts(texts=texts, metadatas=metadatas)
    return True

def get_similar_items(query: str, user_id: int, k: int = 5):
    """Find items similar to a query string."""
    store = get_vector_store()
    results = store.similarity_search(
        query,
        k=k,
        filter={"user_id": user_id}
    )
    return results
