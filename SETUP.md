# AEGIS — Quick Setup Guide

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **npm** 9+

---

## One-Click Run (Recommended)

### Windows
```bash
run.bat
```

### Mac/Linux
```bash
chmod +x run.sh
./run.sh
```

---

## Manual Setup

### Backend (Terminal 1)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

**Backend URL**: http://127.0.0.1:8000
**API Docs**: http://127.0.0.1:8000/docs

---

### Frontend (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

**Frontend URL**: http://localhost:3000

---

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard Overview - Summary metrics and quick stats |
| `/graph` | Network Graph - Interactive node visualization |
| `/attribution` | Attribution - Command node analysis and ranking |
| `/fingerprints` | Fingerprints - Behavioral pattern clusters |
| `/analytics` | Analytics - Charts and statistical analysis |
| `/alerts` | Alerts - Filterable alert log table |

---

## Verify Installation

1. Open http://127.0.0.1:8000/health → Should return `{"status": "success"}`
2. Open http://localhost:3000 → Should show AEGIS Dashboard
3. Click "Run Analysis" button → Should process data and show results

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /pipeline` | Run full analysis pipeline |
| `GET /alerts` | Get alerts with filtering |
| `GET /graph` | Get network graph data |
| `GET /fingerprints` | Get behavioral fingerprints |
| `GET /command-node` | Get command node attribution |
| `GET /metrics` | Get pipeline metrics |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8000 in use | `uvicorn app:app --reload --port 8001` |
| Port 3000 in use | `npm run dev -- -p 3001` |
| Python not found | Install Python 3.10+ from python.org |
| Node not found | Install Node.js 18+ from nodejs.org |
| Module not found | Re-run `pip install -r requirements.txt` |
| API connection error | Ensure backend is running first |
| CORS error | Check NEXT_PUBLIC_API_URL in .env.local |

---

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## Project Structure

```
aegis/
├── backend/
│   ├── app.py              # FastAPI entry point
│   ├── main.py             # Pipeline orchestrator
│   ├── requirements.txt    # Python dependencies
│   └── data/               # Generated JSON data files
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages
│   │   │   ├── page.tsx           # Dashboard
│   │   │   ├── graph/page.tsx     # Network Graph
│   │   │   ├── attribution/page.tsx
│   │   │   ├── fingerprints/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── alerts/page.tsx
│   │   ├── components/     # React components
│   │   └── lib/            # API utilities
│   ├── package.json        # Node dependencies
│   └── .env.local          # Environment config
│
├── run.bat                 # Windows run script
├── run.sh                  # Mac/Linux run script
├── SETUP.md                # This file
└── README.md               # Full documentation
```
