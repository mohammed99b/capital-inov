# BTP Manager SaaS

A full-stack construction management platform (SaaS).

## Tech Stack

- **Backend:** Django 5, DRF, SimpleJWT, PostgreSQL
- **Frontend:** React 18, TypeScript, Tailwind CSS, Zustand, React Query
- **Infrastructure:** Docker-ready, configured for Render.com

## Local Development Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Migrations
python manage.py makemigrations core
python manage.py migrate

# Seed Data (Creates Admin user: admin@btp.com / password123)
python manage.py seed_data

# Run Server
python manage.py runserver
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.
Login with `admin@btp.com` / `password123`.

## Deployment on Render.com

1. **Database:** Create a **PostgreSQL** database on Render. Copy the `Internal DB URL`.
2. **Backend (Web Service):**
   - Connect GitHub repo.
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
   - Start Command: `gunicorn backend.wsgi:application`
   - **Environment Variables:**
     - `PYTHON_VERSION`: `3.11.0`
     - `DATABASE_URL`: (Paste your Internal DB URL)
     - `django_secret_key`: (Generate a random string)
     - `DEBUG`: `False`
     - `ALLOWED_HOSTS`: `*` (or your specific render domain)
3. **Frontend (Static Site):**
   - Connect GitHub repo.
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - **Environment Variables:**
     - `VITE_API_URL`: (The URL of your deployed Backend Web Service, e.g., `https://my-backend.onrender.com`)
   - **Redirect/Rewrite Rules:**
     - Source: `/*`
     - Destination: `/index.html`
     - Action: `Rewrite`
