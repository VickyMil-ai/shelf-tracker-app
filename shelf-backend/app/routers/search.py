from fastapi import APIRouter, HTTPException, Query
import httpx
import os

router = APIRouter()

TMDB_BASE = "https://api.themoviedb.org/3"
OPENLIBRARY_BASE = "https://openlibrary.org"


def get_tmdb_auth():
    """Support both TMDB v3 API keys and v4 Bearer access tokens."""
    token = os.getenv("TMDB_API_KEY")
    if not token:
        raise HTTPException(status_code=503, detail="TMDB_API_KEY is not configured")

    if token.startswith("eyJ"):
        return {"Authorization": f"Bearer {token}"}, {}
    return {}, {"api_key": token}


@router.get("/films")
async def search_films(q: str = Query(..., min_length=1)):
    headers, auth_params = get_tmdb_auth()
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(
                f"{TMDB_BASE}/search/movie",
                headers=headers,
                params={**auth_params, "query": q, "language": "en-US", "page": 1}
            )
            res.raise_for_status()
            data = res.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="TMDB search is unavailable") from exc

    results = []
    for movie in data.get("results", [])[:6]:
        # Get genre names from genre_ids
        genre_ids = movie.get("genre_ids", [])
        genres = get_tmdb_genres(genre_ids)

        results.append({
            "title": movie.get("title"),
            "year": movie.get("release_date", "")[:4],
            "genre": ", ".join(genres[:2]) if genres else None,
            "poster": f"https://image.tmdb.org/t/p/w92{movie['poster_path']}" if movie.get("poster_path") else None,
            "overview": movie.get("overview", "")[:150],
        })

    return results


@router.get("/books")
async def search_books(q: str = Query(..., min_length=1)):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(
                f"{OPENLIBRARY_BASE}/search.json",
                params={"q": q, "limit": 6, "fields": "title,author_name,subject,cover_i,first_publish_year"}
            )
            res.raise_for_status()
            data = res.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Open Library search is unavailable") from exc

    results = []
    for book in data.get("docs", [])[:6]:
        subjects = book.get("subject", [])
        # Pick first 2 clean subjects as genre
        genre = ", ".join(subjects[:2]) if subjects else None

        results.append({
            "title": book.get("title"),
            "year": str(book.get("first_publish_year", "")),
            "author": book.get("author_name", [""])[0] if book.get("author_name") else None,
            "genre": genre,
            "cover": f"https://covers.openlibrary.org/b/id/{book['cover_i']}-S.jpg" if book.get("cover_i") else None,
        })

    return results


# TMDB genre map (static, doesn't change often)
TMDB_GENRE_MAP = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
}

def get_tmdb_genres(genre_ids: list) -> list:
    return [TMDB_GENRE_MAP[gid] for gid in genre_ids if gid in TMDB_GENRE_MAP]
