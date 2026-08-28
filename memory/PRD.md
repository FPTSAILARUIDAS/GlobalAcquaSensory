# Global Acqua Sensory App - PRD

## Problem Statement
Build and enhance the "Global Acqua Sensory App" - a full-stack FastAPI/React/MongoDB application for sensory quality control analysis at Global Acqua Pvt Ltd.

## Architecture
- **Backend**: FastAPI, Python, MongoDB (motor), JWT auth (passlib + bcrypt)
- **Frontend**: React, react-router-dom, axios, Tailwind CSS, Shadcn/UI
- **Database**: MongoDB (test_database)

## Key Components
```
/app/
├── backend/
│   ├── server.py (all routes + models)
│   ├── requirements.txt (bcrypt==4.0.1, passlib[bcrypt]==1.7.4)
│   └── .env
└── frontend/
    └── src/
        ├── App.js (routing)
        ├── utils/api.js (dynamic API URL resolution)
        └── components/
            ├── InteractiveSummaryReport.js (unified summary component)
            ├── BlindTestDailySummary.js (thin wrapper, purple theme)
            ├── ProficiencyTestDailySummary.js (thin wrapper, green theme)
            ├── AdminDashboard.js
            ├── DailySummarySheet.js
            ├── BallotForm.js, BlindTestForm.js, ProficiencyTestForm.js
            ├── Login.js, SummaryReport.js, ReportView.js, PrintableReport.js
```

## Completed Features
- [x] Regular, Sensory Blind, and Proficiency test forms
- [x] Admin Dashboard with user management, session management, daily summaries
- [x] Interactive Blind Test Summary (purple theme) with editable actual values
- [x] Interactive Proficiency Test Summary (green theme) with editable actual values
- [x] Dropdown options: IN, Others (with text input), NA for off-notes and statuses
- [x] Match calculation logic (100% when Actual=IN and Panelist=IN)
- [x] Digital signature verification (Verified By section)
- [x] PDF export via print
- [x] Dynamic API URL utility for production/preview/local environments
- [x] bcrypt/passlib compatibility fix (pinned versions)
- [x] **P1 Refactoring**: Unified InteractiveSummaryReport component (Apr 2026)
- [x] **Bug Fix**: Sessions list not loading - optimized /admin/sessions/all from 453MB to 262KB (Apr 2026)
- [x] **Verified**: All data access points working - sessions, daily summary, blind test, proficiency test, individual reports (Apr 2026)
- [x] **Permanent Fix**: Daily summary endpoint - MongoDB-level date filtering replacing Python-level filtering with 1000 limit, DB indexes added (Apr 2026)
- [x] **Permanent Fix**: api.js uses window.location.origin for universal domain compatibility (Apr 2026)
- [x] **Bug Fix**: Cloudflare "invalid or incomplete response" on Daily Summary (Aug 2026)
  - Root cause: each ballot embedded ~940KB base64 `signature` + `signaturePreview` images; heavy dates produced ~30MB responses that Cloudflare/origin dropped mid-transfer
  - Fix: `get_daily_summary` projection excludes `ballots.signature` and `ballots.signaturePreview` (unused by summary views; individual session reports via /sessions/{id} still return full signatures)
  - Added GZipMiddleware (minimum_size=1024); heaviest date now ~1.1MB on the wire in 0.5s
  - Verified in browser: Daily Summary 2026-06-18 (24 sessions), Blind Summary 2026-06-18 (10 sessions), Proficiency Summary 2026-06-26 (10 sessions) all render with verification signatures intact
  - NOTE: if user saw error on deployed production app, a redeploy is required to pick up this fix
- [x] **Feature**: NA option added to IN/OUT dropdown in Blind Test and Proficiency Test forms; Proficiency off-note description changed from free text to same 10-option dropdown as Blind Test (Aug 2026, browser-verified)
- [x] **Feature**: Renamed "Proficiency Test" to "SPPS Test" across all UI labels (start button, form heading, admin tab, summary report title, daily summary type labels, individual report titles). Internal testType value "proficiency" and routes unchanged for data compatibility (Aug 2026, browser-verified)
- [x] **Bug Fix**: "Login failed" report (Aug 2026) - backend auth verified fully working; failure coincided with transient preview pod restarts (502). Frontend hardened: 30s login timeout, 401 shows "Incorrect username or password", network/5xx shows "Server is temporarily unavailable" instead of misleading credentials message. Verified by testing agent (iteration_3.json, 100% pass)
- [x] **ROOT-CAUSE FIX**: Intermittent Cloudflare 502 Bad Gateway + "Uncaught runtime errors" (Aug 2026)
  - Root cause: GET /api/sessions returned up to 1000 FULL sessions incl. base64 ballot signatures = ~1.57 GB JSON for admin (~370MB for heavy panelists), fired on EVERY login via fetchHistory() (whose data was never even rendered - HistoryView unused). This exhausted the origin -> 502s and pod instability.
  - Fixes: (1) GET /api/sessions now projects out ballots.signature/signaturePreview/verificationSignature, capped at 200 records (1.57GB -> 256KB, 0.34s); (2) App.js login now does lightweight GET /api/ connectivity ping instead; removed dead history state/HistoryView import; (3) ErrorBoundary wraps app (friendly reload screen instead of red overlay); (4) axios interceptor auto-retries transient GET failures (3x backoff on network/502/503/504); (5) dev-server error overlay disabled in craco.config.js; (6) lint fixes: submit_ballot status->session_status shadowing, verify-summary ObjectId leak in response, bare except
  - Verified: 100 sequential + 20 concurrent requests all 200, backend RSS flat; testing agent iteration_4.json 100% backend + 100% frontend incl. full ballot submission flow
  - PRODUCTION NOTE: user must redeploy for the fix to reach https://sensory-dashboard-1.emergent.host

## DB Schema
- **users**: `{username, password_hash, role, signature: Optional[str]}`
- **sessions**: `{sessionCode, productType, testType, status, ballots: List[BallotData], createdAt, completedAt}`
- **verifications**: `{date, verifiedBy, verifiedByName, signature, ...}`

## Key API Endpoints
- POST /api/auth/login
- POST /api/sessions/submit
- POST /api/users/signature
- POST /api/verifications/save
- GET /api/admin/daily-summary/{date}

## Backlog / Future Tasks
- None currently planned
