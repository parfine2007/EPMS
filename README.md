# EPMS

Employee and Payroll Management System with an Express/MongoDB backend and a React/Vite frontend.

## Project structure

- `backend-project`: Express API and MongoDB models
- `frontend-project`: React application

## Requirements

- Node.js 18 or newer
- MongoDB

## Backend setup

```powershell
Set-Location backend-project
npm ci
Copy-Item .env.example .env
npm start
```

Update `.env` with a valid MongoDB connection string and a private JWT secret before starting the server.

## Frontend setup

```powershell
Set-Location frontend-project
npm ci
npm run dev
```

The frontend uses `http://localhost:5000/api` by default. Set `VITE_API_URL` when the API runs at another address.

## Validation

```powershell
Set-Location frontend-project
npm run build
```

The backend files can be syntax-checked with `node --check`.
