"""
app.py — AEGIS API Application Entry Point
FastAPI application with CORS middleware and Swagger docs.

Usage:
    uvicorn app:app --reload

Docs:
    http://127.0.0.1:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routes import router
from api.service import API_VERSION, log


# ── Lifespan Handler ───────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events."""
    print("\n" + "=" * 60)
    print("  AEGIS Cyber-Infrastructure Defense API")
    print(f"  Version: {API_VERSION}")
    print("  Status:  ONLINE")
    print("-" * 60)
    print("  Docs:    http://127.0.0.1:8000/docs")
    print("  ReDoc:   http://127.0.0.1:8000/redoc")
    print("=" * 60 + "\n")
    log("INFO", "AEGIS API Started")

    yield

    log("INFO", "AEGIS API Shutdown")
    print("\n[AEGIS] API Shutdown Complete\n")


# ── FastAPI App Initialization ─────────────────────────────────────────────────

app = FastAPI(
    title="AEGIS Cyber-Infrastructure Defense API",
    description="""
## AEGIS Detection Pipeline API

Real-time cyber threat detection and infrastructure defense system.

---

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API status |
| `/health` | GET | Health check |
| `/alerts` | GET | Detection alerts (filterable) |
| `/metrics` | GET | Pipeline metrics |
| `/summary` | GET | Combined overview |
| `/run-pipeline` | POST | Trigger detection |

---

### Response Format

**Success:**
```json
{
  "status": "success",
  "data": {...},
  "timestamp": "2026-03-28T12:00:00Z",
  "version": "1.0",
  "request_id": "a1b2c3d4",
  "processing_time_ms": 12.5
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Error description",
  "timestamp": "2026-03-28T12:00:00Z",
  "version": "1.0",
  "request_id": "a1b2c3d4",
  "processing_time_ms": 5.2
}
```

---

### Alert Levels

| Level | Severity | Description |
|-------|----------|-------------|
| ATTACK | Critical | Active threat detected |
| HIGH_RISK | High | High probability threat |
| SUSPICIOUS | Medium | Anomalous activity |
| CLEAN | Low | Normal operation |

    """,
    version=API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "System", "description": "API status and health endpoints"},
        {"name": "Detection", "description": "Alerts, metrics, and summary endpoints"},
        {"name": "Pipeline", "description": "Detection pipeline execution"}
    ],
    lifespan=lifespan
)


# ── CORS Middleware ────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Include Routes ─────────────────────────────────────────────────────────────

app.include_router(router)
