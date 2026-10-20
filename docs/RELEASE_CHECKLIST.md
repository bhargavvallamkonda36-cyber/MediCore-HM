# MediCore HMS — Release & Deployment Checklist

## Before release
- [ ] Commit or back up the working project.
- [ ] Remove placeholder/test accounts and test data from production.
- [ ] Store database URL, JWT secrets, and Redis configuration in deployment secrets.
- [ ] Use distinct, strong JWT access and refresh secrets.
- [ ] Confirm CORS allows only the intended frontend origin(s).
- [ ] Ensure password hashes—not plaintext passwords—are stored.
- [ ] Verify inactive accounts cannot sign in.
- [ ] Verify RBAC is enforced in controllers/services, not only in the UI.
- [ ] Check that patient and medical data is not exposed to unauthorized roles.
- [ ] Ensure logs do not contain passwords, tokens, or sensitive clinical data.

## Build and test locally
Backend:
```powershell
cd D:\MediCore\backend
npm run build
npm test
```
Frontend:
```powershell
cd D:\MediCore\frontend
npm run build
```
Run e2e tests if configured:
```powershell
cd D:\MediCore\backend
npm run test:e2e
```

## Database and deployment
- [ ] Provision a managed PostgreSQL database and Redis service, or secure equivalent infrastructure.
- [ ] Run the project's reviewed Prisma migration/deployment command against the target database; do not run a destructive reset on production.
- [ ] Set `DATABASE_URL`, Redis variables, JWT secrets, `PORT`, and `FRONTEND_URL` in the backend environment.
- [ ] Set `NEXT_PUBLIC_API_URL` in the frontend environment to the deployed API base URL (without a trailing slash if the app concatenates paths).
- [ ] Configure HTTPS for frontend and API.
- [ ] Configure health checks, backups, monitoring, and a rollback plan.
- [ ] Test login, dashboard, doctor creation, appointments, clinical records, billing, and payment flows against the deployed system.

## Note
Exact hosting commands depend on the selected provider and the existing package scripts. Do not deploy by copying local `.env` files or hard-coding secrets into source code.
