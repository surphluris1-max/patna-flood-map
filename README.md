# Patna Flood Map 🌊

**Problem:** During the monsoon, Patna streets flood and nobody knows which roads to avoid.
**Who it helps:** Commuters, delivery riders and parents on the school run.
**How it works:** People drop a pin (with a photo) on a flooded street. Everyone sees it live on a map. Reports expire after 6 hours so the map stays honest.

## Tech
React + Vite + Leaflet (OpenStreetMap) · AWS Amplify Hosting · API Gateway · Lambda (Node 20) · DynamoDB (with TTL) · S3 (photos)

```
Browser ──► API Gateway ──► Lambda ──► DynamoDB (reports, auto-expire)
   │                           └────► S3 (photos via presigned URLs)
   └── hosted on Amplify
## AWS tools used
- AWS SAM CLI (open source): the backend is defined in backend/template.yaml
  (API Gateway, Lambda, DynamoDB, S3) and built with `sam build`.
- Not deployed: the live demo runs the frontend in demo mode.
```

## Run locally (no AWS needed)
```bash
cd frontend && npm install && npm run dev
```
With no `VITE_API_URL`, the app runs in **demo mode** (reports saved in your browser, sample data in Patna, photos ignored).

## Deploy the backend (needs AWS CLI + SAM CLI + `aws configure`)
```bash
cd backend
sam build
sam deploy --guided      # region: ap-south-1, accept defaults
```
Copy the `ApiUrl` from the outputs.

## Deploy the frontend
1. Amplify Console → Host web app → GitHub → pick this repo, app root = `frontend`
2. Environment variables → add `VITE_API_URL` = the ApiUrl above → redeploy

## Structure
```
frontend/src/App.jsx              state + layout
frontend/src/api.js               API calls (demo mode when no URL)
frontend/src/constants.js         severity levels, map centre, helpers
frontend/src/components/          FloodMap, ReportForm, ReportList
frontend/src/styles.css           all styling (colour tokens at the top)
backend/template.yaml             whole AWS backend as code (SAM)
backend/src/                      3 Lambda handlers
```

## Ideas to extend
SNS SMS alerts for saved areas · rain forecast from Open-Meteo · "still flooded?" confirm button · Hindi labels
