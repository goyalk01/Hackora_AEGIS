# AEGIS — Cyber-Infrastructure Defense System

> **Detect the truth beneath the lies. Hunt threats hiding inside "Operational" systems.**

[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Hackathon--Ready-orange)]()

---

## Overview

**AEGIS** is a complete cyber-infrastructure defense system that detects hidden attacks in infrastructure logs — even when the logs themselves are designed to deceive.

Traditional monitoring trusts what logs *say*. AEGIS trusts what logs *reveal*.

| Component | Description |
|-----------|-------------|
| **Step 1** | Data Engineering — Schema-aware normalization pipeline |
| **Step 2** | Detection Engine — Rule-based threat classification |
| **Step 3** | API Layer — FastAPI backend with filtering and metrics |

---

## Problem Statement

Modern cyber attacks exploit the gap between **what a system reports** and **what it actually does**:

- A compromised node reports `"status": "Operational"` while returning HTTP `500`
- A malicious process injects Base64-encoded payloads into hardware fingerprint fields
- Response time spikes to 4000ms while logs claim the node is "healthy"
- JSON schemas change across versions — a single field has 3 different names

**Traditional monitoring fails because it reads the status field. AEGIS reads the HTTP code.**

---

## Solution Approach

AEGIS extracts ground truth from contradictions:

```
Reported State  ──→  (IGNORED as untrusted)
HTTP Status     ──→  Ground truth signal #1
Response Time   ──→  Ground truth signal #2
Hardware ID     ──→  Ground truth signal #3 (Base64 decoded + scanned)
Schema Version  ──→  Dynamic mapping → always resolves to canonical fields
```

All classification is **deterministic and rule-based** — no ML, no ambiguity, fully auditable.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      RAW DATA SOURCES                          │
│   node_registry.json │ system_logs.json │ schema_versions.json │
└──────────────────────────┬──────────────────────────────────────┘
                           │
             ┌─────────────▼─────────────┐
             │     STEP 1: NORMALIZE     │
             │  loader.py + normalizer.py│
             │  → normalized_logs.json   │
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │     STEP 2: DETECT        │
             │  rules.py + evaluator.py  │
             │  + detector.py            │
             │  → alerts.json            │
             │  → metrics.json           │
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │     STEP 3: API           │
             │  app.py + api/routes.py   │
             │  + api/service.py         │
             │  → REST endpoints         │
             └───────────────────────────┘
```

---

## Core Features

| Feature | Detail |
|---------|--------|
| **Schema-aware normalization** | v1/v2/v3 field names dynamically resolved via `schema_versions.json` |
| **5-stage Base64 pipeline** | Format check → decode → UTF-8 → malicious keyword scan → clean |
| **Rule-based anomaly detection** | 7 deterministic rules, zero model drift |
| **Priority-ordered classification** | `ATTACK > HIGH_RISK > SUSPICIOUS > CLEAN` — never downgrades |
| **Severity scoring** | 0–100 score: base per level + bonus per triggered rule |
| **Confidence scoring** | `min(rules_fired × 25, 100)` — 4+ rules = 100% |
| **FastAPI REST API** | Filtered alerts, metrics, summary, pipeline trigger |
| **Standardized responses** | Consistent JSON structure with timestamps and request tracking |

---

## Detection Logic

### Rule Priority: `ATTACK > HIGH_RISK > SUSPICIOUS > CLEAN`

All rules are evaluated. The **highest-priority rule that fires** determines the final level.

### ATTACK (Critical)

| Rule | Condition |
|------|-----------|
| `status_contradiction` | `reported_status == "OPERATIONAL"` AND `http_status >= 400` |
| `server_error` | `http_status >= 500` |
| `invalid_hardware_id` | `hardware_id_valid == False` |
| `unknown_http_status` | `http_status == -1` (missing/sentinel) |

### HIGH_RISK

| Rule | Condition |
|------|-----------|
| `extreme_latency` | `response_time_ms >= 3000ms` |

### SUSPICIOUS

| Rule | Condition |
|------|-----------|
| `elevated_latency` | `1500ms <= response_time_ms < 3000ms` |

### Example

```json
Input: { "status": "Operational", "http_code": 500, "latency": 4200,
         "hardware_id_b64": "TUFMV0FSRV9QQVlMT0FEX3Yy" }

Decoded hardware_id: "MALWARE_PAYLOAD_v2" → INVALID

Rules fired:
  ✅ status_contradiction  (OPERATIONAL + HTTP 500)
  ✅ server_error          (HTTP 500)
  ✅ invalid_hardware_id   (malicious keyword detected)
  ✅ extreme_latency       (4200ms >= 3000ms)

Result: ATTACK | severity: 100 | confidence: 100%
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API status and available endpoints |
| `GET` | `/health` | Health check |
| `GET` | `/alerts` | Detection alerts with filtering |
| `GET` | `/metrics` | Pipeline metrics and statistics |
| `GET` | `/summary` | Combined metrics + top critical alerts |
| `POST` | `/run-pipeline` | Trigger detection pipeline |

### Query Parameters for `/alerts`

| Parameter | Type | Description |
|-----------|------|-------------|
| `level` | string | Filter: `ATTACK`, `HIGH_RISK`, `SUSPICIOUS`, `CLEAN` |
| `region` | string | Filter by region (case-insensitive) |
| `node_id` | string | Filter by exact node_id |
| `limit` | int | Max results (default: 50, max: 100) |

**Sorting:** Results sorted by `severity_score` DESC, then `timestamp` DESC.

---

## API Response Format

### Success Response

```json
{
  "status": "success",
  "data": {
    "total": 5,
    "alerts": [...]
  },
  "timestamp": "2026-03-28T12:00:00Z",
  "version": "1.0",
  "request_id": "a1b2c3d4",
  "processing_time_ms": 12.5
}
```

### Error Response

```json
{
  "status": "error",
  "message": "No alerts file found. Run the pipeline first.",
  "timestamp": "2026-03-28T12:00:00Z",
  "version": "1.0",
  "request_id": "e5f6g7h8",
  "processing_time_ms": 2.1
}
```

### Sample Alert Object

```json
{
  "log_id": "LOG-1001",
  "node_id": "NODE-001",
  "node_name": "Alpha Server",
  "region": "US-EAST",
  "timestamp": "2024-03-01T12:05:00Z",
  "alert_level": "ATTACK",
  "severity_score": 100,
  "confidence_score": 100,
  "is_anomaly": true,
  "primary_reason": "Deceptive node: reports OPERATIONAL but HTTP=500",
  "reasons": [
    "Deceptive node: reports OPERATIONAL but HTTP=500",
    "Server failure: HTTP=500",
    "Invalid hardware ID: Malicious pattern detected"
  ],
  "rule_ids": ["status_contradiction", "server_error", "invalid_hardware_id"]
}
```

### Sample Metrics Response

```json
{
  "status": "success",
  "data": {
    "total_logs": 13,
    "total_alerts": 13,
    "attack_count": 5,
    "high_risk_count": 1,
    "suspicious_count": 2,
    "clean_count": 5,
    "attack_percentage": 38.46,
    "threat_percentage": 46.15,
    "total_nodes": 10,
    "nodes_under_attack": ["NODE-001", "NODE-003", "NODE-005", "NODE-007"]
  },
  "timestamp": "2026-03-28T12:00:00Z",
  "version": "1.0"
}
```

---

## Project Structure

```
backend/
├── app.py                 # FastAPI application entry point
├── main.py                # Pipeline orchestrator
├── loader.py              # Fault-tolerant JSON loader
├── normalizer.py          # Schema-aware normalization
├── rules.py               # Detection thresholds and config
├── evaluator.py           # Rule evaluation functions
├── detector.py            # Detection engine orchestrator
├── utils.py               # Safe casts, Base64 validator
├── api/
│   ├── routes.py          # HTTP endpoint definitions
│   └── service.py         # Service layer (business logic)
├── data/
│   ├── system_logs.json        # Raw input logs
│   ├── node_registry.json      # Node metadata
│   ├── schema_versions.json    # Schema field mappings
│   ├── normalized_logs.json    # Generated: normalized logs
│   ├── alerts.json             # Generated: detection alerts
│   └── metrics.json            # Generated: aggregate metrics
├── pipeline_test.py       # Normalization smoke test
└── detection_test.py      # Detection engine unit tests
```

---

## How to Run

### Prerequisites

```bash
Python 3.10+
pip install fastapi uvicorn
```

### Start the API Server

```bash
cd backend
uvicorn app:app --reload
```

Open: **http://127.0.0.1:8000/docs** (Swagger UI)

### Run Pipeline Only (CLI)

```bash
cd backend
python main.py
```

### Run Unit Tests

```bash
cd backend
python detection_test.py
```

Expected: **9/9 tests pass**

---

## Testing

| # | Case | Validates |
|---|------|-----------|
| 1 | CLEAN | Healthy log → no rules fire |
| 2 | SUSPICIOUS | Latency 1800ms → `elevated_latency` |
| 3 | HIGH_RISK | Latency 3500ms → `extreme_latency` |
| 4 | ATTACK | HTTP 500 + deceptive status + malicious HW |
| 5 | ATTACK | HTTP 502 + invalid hardware ID |
| 6 | ATTACK | Missing http_status (sentinel -1) |
| 7 | ATTACK | Invalid Base64 format |
| 8 | ATTACK | Unknown schema version fallback |
| 9 | Regression | Latency rules mutually exclusive |

---

## Security & Reliability

### Base64 Safety
The 5-stage hardware ID validation pipeline **never executes decoded content**:
```
Format check → Decode bytes → UTF-8 decode → Keyword scan → Safe storage
```

**Malicious keywords scanned:** `MALWARE`, `PAYLOAD`, `EXPLOIT`, `INJECT`, `SHELL`, `CMD`, `EXEC`, `BACKDOOR`, `ROOTKIT`, `TROJAN`, `RANSOMWARE`, `KEYLOG`

### Fault Tolerance
- **Loader:** File errors return empty list, never crash
- **Normalizer:** Unknown schema → v1 fallback; missing field → sentinel
- **Detector:** Per-rule and per-log exception handling
- **API:** Safe JSON parsing, no `eval()`, proper error responses

---

## Performance

- **O(n) single-pass** processing for normalize + detect
- **O(1) dict lookups** for registry and schema maps
- **Lightweight API** — file-based reads, no database overhead
- **Request tracking** — unique request_id and processing_time_ms per call

---

## Hackathon Context

Built for the **AEGIS Cyber-Infrastructure Defense** challenge.

Design philosophy:
- **Correctness over complexity** — deterministic rules, auditable results
- **Simplicity over overengineering** — zero ML, zero external libraries for core logic
- **Truth over reported state** — HTTP codes + latency over status strings

---

## Future Scope

- **Frontend Dashboard** — React/Next.js with alert tables and threat heatmaps
- **Real-time Processing** — WebSocket push for live alert streaming
- **Multi-tenant Support** — Organization-scoped data isolation
- **Export & Reporting** — CSV/PDF alert reports with filtering
- **Horizontal Scaling** — Redis caching, async pipeline workers

---

## Author

**Krish Goyal**
GitHub: [github.com/goyalk01](https://github.com/goyalk01)

---

<div align="center">

*"Trust the HTTP code. Never trust the status string."*

**AEGIS — The Shield That Sees Through Lies.**

</div>
