# AI Budget API

A lightweight personal finance and budgeting project combining a FastAPI backend with a Vite + React frontend. It includes CSV import for bank statements, transaction categorization, and a simple portfolio tracker.

## What this repo contains
- `backend/` — FastAPI application and AI integration utilities
- `frontend/` — Vite + React UI
- `bank_statement_sample.csv` — sample bank CSV
- `sample_transactions.csv` — sample data to exercise the backend
- `start_app.ps1` — convenience script to start backend + frontend on Windows

## Quickstart (Windows)
1. Create and activate a Python virtual environment in the project root:

```powershell
python -m venv venv
& .\venv\Scripts\Activate.ps1
```

2. Install backend dependencies:

```powershell
pip install -r backend\requirements.txt
```

3. Install frontend dependencies and start the frontend (from `frontend`):

```powershell
cd frontend
npm install
npm run dev
```

4. (Optional) Run the startup helper from project root to launch both services:

```powershell
powershell -ExecutionPolicy Bypass -File .\start_app.ps1
```

## Environment & Configuration
- Place sensitive keys in environment variables or a `.env` file consumed by the backend. Example variables the backend may read:

- `GEMINI_API_KEY` — API key for Google Generative AI (if used)

## Notes on the codebase
- `backend/main.py` exposes REST endpoints for uploads, transaction listing, and portfolio operations.
- `backend/ai_service.py` contains AI integration helpers — ensure you have the correct API key configured before enabling.
- CSV uploads are expected to include at least `date`, `description`, and `amount` columns (case-insensitive).

## Tests & Local Data
- Use `sample_transactions.csv` and `bank_statement_sample.csv` to exercise upload endpoints.

## Committing & Pushing
I will commit the README update and attempt to push to `https://github.com/Uzair-hp/ai_budget_api.git`. Pushing may prompt for authentication unless your Git credentials are already configured.

## Author
Uzair-hp — https://github.com/Uzair-hp

---

If you want, I can also:
- run the backend to verify endpoints
- run the frontend and open the app
- create a GitHub Actions workflow to run tests

Tell me which of these you'd like next.
