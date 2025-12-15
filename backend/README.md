# QuanXAI Backend

AI Landing Zone Platform - FastAPI Backend with LiteLLM integration.

## Setup

```bash
uv venv
source .venv/bin/activate
uv pip install -e .
```

## Run

```bash
# Seed database with dummy data
python scripts/seed_data.py

# Start server
uvicorn src.quanxai.main:app --reload --port 8000
```

## API Endpoints

- `GET /api/organizations` - List organizations
- `GET /api/teams` - List teams
- `GET /api/users` - List users
- `GET /api/analytics/organization` - Organization metrics
- `GET /api/analytics/teams/{team_id}` - Team metrics
- `GET /api/analytics/models/{model_id}` - Model metrics
- `GET /api/analytics/users/{user_id}` - User metrics
