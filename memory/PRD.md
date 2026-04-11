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
