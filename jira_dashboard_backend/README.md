# Jira Dashboard Backend Proxy

This backend is a secure Node.js/Express server acting as a proxy to Jira API for the Jira Dashboard application.

## Endpoints

- `POST /api/login`  
  Receives `{ domain, email, apiToken }`.  
  Authenticates using Jira's `/myself`.  
  Saves credentials in session (not sent to client).

- `GET /api/projects`  
  Requires an authenticated session.  
  Requests projects from Jira `/project/search` using stored credentials.

- `POST /api/logout`
  Clears Jira credentials from session.

## Security

- **Jira credentials are never exposed to the frontend or client browser.**
- Credentials are stored only on the backend session during an active user session.
- CORS is restricted to frontend origins in `.env`.

## Setup

1. Copy `.env.example` to `.env` and set your values.
2. Install dependencies:  
   `npm install`
3. Start server:  
   `npm start`

## .env variables

- `ORIGINS` — Allowed frontend(s), comma-separated
- `SESSION_SECRET` — Secret for session encryption

---
