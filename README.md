# PhishGuard (PS10)

Phishing Link & Suspicious Message Heuristic Analyzer — hackathon scaffold.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, Tailwind CSS, shadcn/ui, Lucide React |
| Backend | Python, Flask |
| Detection | Python heuristic engine (stub) |
| AI | Gemini API (stub) |
| Auth | JWT + Werkzeug (stub) |
| Database | MongoDB Atlas (stub) |

## Quick start

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python app.py
```

API runs at **http://localhost:5000**

Health check: **http://localhost:5000/health**

### 2. Frontend

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

App runs at **http://localhost:5173**

The Vite dev server proxies `/api` and `/health` to the Flask backend.

## Project layout

```
hackthon/
├── backend/          # Flask API
├── frontend/         # React + Vite UI
├── .gitignore
└── README.md
```

See folder comments in each package for details.
