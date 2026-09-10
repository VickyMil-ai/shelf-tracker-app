# Shelf

Shelf is a personal film and book tracker with AI-powered recommendations. Create an account, organize what you have watched or read, maintain a planning list, rate items, and get recommendations based on your taste.

## Features

- Account registration and JWT-based authentication
- Film and book tracking with ratings, genres, notes, and statuses
- Planning lists for books to read and films to watch
- Film search through TMDB
- Book search through Open Library
- Personalized OpenAI recommendations based on highly rated items
- AI-assisted selection from your planning list
- Responsive React interface
- Local development and Docker-based production workflows

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React, React Router, Axios |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL, pgvector |
| Authentication | JWT, bcrypt |
| AI | OpenAI, LangChain |
| External data | TMDB, Open Library |
| Containers | Docker Compose, Nginx, Supervisor |

## Project structure

```text
tracker-app/
├── shelf-frontend/       # React application
├── shelf-backend/        # FastAPI application
├── Dockerfile            # Combined frontend/backend app image
├── docker-compose.yml    # App and PostgreSQL services
├── nginx.conf            # Static frontend and /api proxy
└── supervisord.conf      # Runs Nginx and FastAPI in the app container
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection used by FastAPI |
| `SECRET_KEY` | Yes | Signs authentication tokens |
| `OPENAI_API_KEY` | For recommendations | Generates embeddings and recommendations |
| `TMDB_API_KEY` | For film search | Searches the TMDB film catalog |

Open Library does not require an API key. Never commit a real `.env` file or API key.

## Local development

### Prerequisites

- Python 3.12 or newer
- Node.js and npm
- PostgreSQL
- The pgvector PostgreSQL extension for AI recommendations

### 1. Prepare PostgreSQL

Start PostgreSQL and create the database:

```bash
createdb shelf
psql -d shelf -c 'CREATE EXTENSION IF NOT EXISTS vector;'
```

Confirm the connection:

```bash
psql -d shelf -c '\conninfo'
```

The backend creates the application tables automatically when it starts.

### 2. Configure and start the backend

```bash
cd shelf-backend
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Update `shelf-backend/.env` with your local PostgreSQL username and keys:

```env
DATABASE_URL=postgresql://your_username@localhost:5432/shelf
SECRET_KEY=replace_with_a_long_random_secret
OPENAI_API_KEY=your_openai_api_key
TMDB_API_KEY=your_tmdb_api_key
```

FastAPI runs at http://localhost:8000 and its interactive documentation is available at http://localhost:8000/docs.

### 3. Start the frontend

In a second terminal:

```bash
cd shelf-frontend
npm ci
npm start
```

Open http://localhost:3000. During development, the frontend connects directly to `http://localhost:8000`.

## Run with Docker

The Docker setup uses two containers:

- `app`: builds React, serves it through Nginx, and runs FastAPI
- `db`: runs PostgreSQL with pgvector and persistent storage

Create `.env` in the repository root:

```env
SECRET_KEY=replace_with_a_long_random_secret
OPENAI_API_KEY=your_openai_api_key
TMDB_API_KEY=your_tmdb_api_key
```

Build and start the application:

```bash
docker compose up --build
```

Open http://localhost:3000. API requests under `/api` are forwarded to FastAPI by Nginx.

Stop the services without deleting database data:

```bash
docker compose down
```

For subsequent code changes, Docker's build cache makes this command faster:

```bash
docker compose up -d --build app
```

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Create an account |
| `POST` | `/auth/login` | Log in and receive an access token |
| `GET` | `/auth/me` | Return the authenticated user |
| `GET` | `/items/` | List the authenticated user's items |
| `POST` | `/items/` | Add an item |
| `PUT` | `/items/{item_id}` | Update an item |
| `DELETE` | `/items/{item_id}` | Delete an item |
| `GET` | `/search/films?q=...` | Search TMDB for films |
| `GET` | `/search/books?q=...` | Search Open Library for books |
| `GET` | `/recommendations/` | Generate personalized recommendations |
| `GET` | `/recommendations/next` | Pick an item from the planning list |

Authenticated endpoints require an `Authorization: Bearer <token>` header.

## Frontend commands

Run the development server:

```bash
npm start
```

Create a production build:

```bash
npm run build
```

Run frontend tests:

```bash
npm test
```

## Database access

Open the local database shell:

```bash
psql -d shelf
```

Useful commands:

```sql
\dt
\d users
\d items
SELECT id, username, email FROM users;
SELECT * FROM items ORDER BY created_at DESC;
\q
```

## License

No license has been specified yet.
