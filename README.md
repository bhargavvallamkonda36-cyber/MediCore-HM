# MediCore HMS — Quality, Security & Release Phase

This bundle is an **integration pack** for the existing project at `D:\MediCore` (NestJS + Prisma backend, Next.js frontend). It is not a replacement for your whole application. Merge the files carefully so existing working pages and modules are preserved.

## Included
- RBAC decorator and guard files for the NestJS backend.
- A **reference** doctor controller showing how to apply role restrictions; compare/merge it with your current controller rather than blindly replacing it.
- Jest e2e test starter and a manual regression checklist.
- Frontend usability/search checklist (your Doctors page already has a search input; verify it actually filters results).
- Production environment template and deployment checklist.

## 1. Before changing anything
1. Stop the backend and frontend dev servers with `Ctrl+C` in their terminal windows.
2. Make a copy of `D:\MediCore` or commit your current working code to Git.
3. Extract this ZIP somewhere temporary and copy/merge only the needed files into `D:\MediCore`.

## 2. Backend RBAC files
Copy the files under `backend/src/guards/` into `D:\MediCore\backend\src\guards\`.

- If `roles.decorator.ts`, `roles.guard.ts`, or `guards.module.ts` already exist, compare the files first. Do not create duplicate classes or register the same provider twice.
- Your current JWT guard must run before `RolesGuard` so `request.user.role` is populated.
- Ensure the role field in the JWT payload is named `role` and matches Prisma `UserRole` values: `ADMIN`, `DOCTOR`, `RECEPTIONIST`, `NURSE`, `PATIENT`.
- `@Roles(...)` alone does not protect a route. Apply both `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(...)` to the route/controller.
- The sample controller is a reference, not a blind replacement. Merge its decorators into your existing `doctors.controller.ts` and retain your existing service methods.

Suggested policy for doctor management:
- `GET /doctors` and `GET /doctors/:id`: ADMIN, DOCTOR, RECEPTIONIST, NURSE (restrict individual data further if needed).
- `POST /doctors`, `PATCH /doctors/:id`, `DELETE /doctors/:id`: ADMIN only.

## 3. Build and run backend
In a terminal:
```powershell
cd D:\MediCore\backend
npm run build
```
If build succeeds, start the backend in one terminal:
```powershell
npm run start:dev
```
If you see `EADDRINUSE :::4000`, another backend is already running. Do not launch a second one. Check the listener with:
```powershell
netstat -ano | findstr :4000
```
Then use the PID shown by `netstat` with `tasklist /FI "PID eq <PID>"`. Stop only a confirmed stale Node process if needed.

## 4. Testing
Your project may already have Jest configured by Nest CLI. Check `backend/package.json` before adding scripts. Typical commands:
```powershell
cd D:\MediCore\backend
npm test
npm run test:e2e
```
The provided e2e file is a starter and may need the real login endpoint, credentials, and route behavior from your current app. Do not treat a placeholder test as proof of full security coverage.

Manual RBAC checks:
1. Sign in as ADMIN and copy the actual access token from the login response/browser storage.
2. With `Authorization: Bearer <token>`, verify admin can `POST /doctors` and `PATCH /doctors/:id`.
3. Sign in as a DOCTOR or RECEPTIONIST and verify the same write operations return `403`.
4. Verify missing/invalid tokens return `401`.
5. Verify permitted read operations work for the intended roles.
6. Never put real passwords, JWT secrets, or production connection strings into this ZIP or Git.

## 5. Frontend usability
Use `frontend/docs/USABILITY_TEST_CHECKLIST.md` to verify search, loading/error/empty states, status toggle, forms, responsive layout, and API failures. Your Doctors page already has a search field according to the current implementation, but confirm it filters the displayed rows—not just that the input is visible.

## 6. Production readiness
Use `backend/.env.production.example` as a **key-name reference only**. Do not copy placeholder values into production. Set real values in your hosting provider's secret/environment settings. Read `docs/RELEASE_CHECKLIST.md` before deployment.

## Important
- This bundle does not modify your live project automatically.
- Do not replace `app.module.ts`, `package.json`, `.env`, Prisma schema, or working controllers wholesale based on examples.
- After each merge, run the backend build and frontend production build, then test login, dashboard, doctors, patients, appointments, clinical pages, invoices, and payments.
