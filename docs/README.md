# GovLaunch — Innovation Procurement Platform

GovLaunch is a 4-role innovation-procurement platform connecting Indian government departments with startups, built for Smart India Hackathon 2024.

## Tech Stack

- **Backend:** Django 5.x + Django REST Framework + SQLite
- **Frontend:** React 18 + Vite + Tailwind CSS + shadcn/ui
- **PDF Generation:** Jinja2 + WeasyPrint

## Setup Instructions

### Backend

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:8000`.

### Environment Variables

- **Frontend:** Set `VITE_API_BASE_URL` in `.env` (defaults to `http://localhost:8000`)
- **Backend:** Set `CORS_ALLOWED_ORIGINS` as comma-separated list of allowed frontend URLs

## Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Department | health.dept | demo1234 |
| Department | defence.dept | demo1234 |
| Department | niti.dept | demo1234 |
| Startup | meditriage-ai | demo1234 |
| Startup | agrosense-labs | demo1234 |
| Startup | securegrid-systems | demo1234 |
| Startup | ruralpay-connect | demo1234 |
| Startup | cleanair-sensors | demo1234 |
| Startup | diagnoai | demo1234 |
| Startup | dronewatch-defence | demo1234 |
| Startup | watergrid-analytics | demo1234 |
| Evaluator | evaluator1 | demo1234 |
| Evaluator | evaluator2 | demo1234 |
| Admin | admin | demo1234 |

## Resetting Demo Data

Log in as **admin** and click the "Reset Demo Data" button on the Audit Trail page. This wipes all data and re-seeds the original demo state — no server restart needed.

## Health Check

```bash
curl http://localhost:8000/api/health/
# Returns: {"status": "ok"}
```
