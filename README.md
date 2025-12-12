## Campaign Analytics Dashboard (Lite)

A pared-down version of Grippi's Campaign Analytics Dashboard. The frontend is Vite + React and fetches campaigns from a FastAPI mock API backed by SQLite. A SQL seed script is included for PostgreSQL/SQLite setups.

---

### Frontend (React)
- Location: `src/`
- Run locally:
	```powershell
	npm install
	npm run dev
	```
- Default URL: http://localhost:5173
- UI features: status filter (All/Active/Paused), campaign table, quick KPI tiles (clicks, cost, impressions).

### Backend (FastAPI + SQLite)
- Location: `backend/`
- Dependencies: see `backend/requirements.txt`
- Run locally:
	```powershell
	cd backend
	python -m venv .venv
	.\.venv\Scripts\Activate.ps1
	pip install -r requirements.txt
	uvicorn main:app --reload --port 8000
	```
- Endpoints:
	- `GET /` health payload
	- `GET /campaigns` returns all campaigns
	- `GET /campaigns?status=Active` filters by status (`Active` or `Paused`)
- Notes:
	- SQLite database file: `backend/campaigns.db` (auto-created and seeded on startup).
	- CORS allows the Vite dev server at `localhost:5173`.

### Database Seed Script
- Location: `db/init.sql`
- Creates `campaigns` table and inserts 10 sample rows (same data used by the FastAPI seed).
- Run with SQLite:
	```powershell
	sqlite3 campaigns.db < db/init.sql
	```
	For PostgreSQL, run the statements inside `psql` instead of `sqlite3`.

### Project Layout
- `src/` React dashboard
- `backend/` FastAPI mock API and SQLite DB
- `db/init.sql` SQL seed for campaigns table

### Deployment Notes
- Frontend: deploy to Vercel/Netlify using `npm run build`.
- Backend: deploy to Railway/Render/Fly.io. Configure a persistent volume or managed Postgres; run `db/init.sql` once to seed, or rely on the built-in SQLite seeding for quick demos.

### Future Improvements
- Replace SQLite with managed Postgres and SQLAlchemy models.
- Add pagination and date-range filtering.
- Add auth and per-user campaign scopes.
