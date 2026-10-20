# MediCore HMS — Finalization Pack

This is a single-folder add-on pack for finalizing your existing MediCore project. It does not replace your current controllers, services, Prisma schema, or frontend.

## Stack
- Backend: NestJS + TypeScript
- Database: PostgreSQL + Prisma 7 using `@prisma/adapter-pg`
- Authentication: JWT + bcryptjs
- Frontend: Next.js 15 + React + TypeScript + Tailwind CSS
- Local backend: `http://localhost:4000`

## Use
1. Extract this ZIP.
2. Read `SECURITY_TESTS.md`.
3. Run the PowerShell smoke tests while the backend is running.
4. Use `docs/FINAL_CHECKLIST.md` to finish the submission.
5. Do not replace `patients.service.ts` or controllers with guessed code; verify ownership and field restrictions in the actual implementation.
6. Run `npm run build` from both `D:\MediCore\backend` and `D:\MediCore\frontend`.

## Confirmed from recent work
- PostgreSQL connection works.
- Patient login and `/auth/profile` succeeded.
- Patient token was denied access to `GET /patients` with HTTP 403, as expected.
- Port 4000 was already occupied by PID 24828 in one screenshot. Reuse the existing backend or intentionally stop it with `Stop-Process -Id 24828 -Force` before restarting.
- `GET /` returning `Cannot GET /` is normal if no root route exists.
