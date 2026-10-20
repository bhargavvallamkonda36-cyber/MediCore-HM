# MediCore HMS final submission checklist

## Backend
- [ ] `cd D:\MediCore\backend`
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] Prisma schema/client are in sync.
- [ ] PostgreSQL connects using the PrismaPg adapter.
- [ ] `POST /auth/login` works with valid credentials.
- [ ] Invalid credentials return 401.
- [ ] `GET /auth/profile` works with a valid bearer token.
- [ ] Missing/invalid tokens are rejected.
- [ ] Patient cannot list all patient records.
- [ ] Patient cannot create/delete patient records.
- [ ] Patient can read only their own patient record.
- [ ] Patient updates are restricted to approved fields.
- [ ] Role permissions are verified for ADMIN, DOCTOR, RECEPTIONIST, NURSE, PATIENT.
- [ ] Appointments, medical records, prescriptions, invoices, and payments have role/ownership checks.
- [ ] No passwords, JWT secrets, or database credentials are committed.
- [ ] Final `npm run build` succeeds.

## Frontend
- [ ] `cd D:\MediCore\frontend`
- [ ] `npm run build` passes.
- [ ] Login/session handling works.
- [ ] Unauthorized sessions return to login.
- [ ] Role-specific navigation matches backend permissions.
- [ ] Forms show validation and API errors.
- [ ] Loading, empty, and error states are handled.
- [ ] Dashboard statistics display without console errors.
- [ ] Patients, doctors, departments, appointments, medical records, medications, prescriptions, invoices, payments, and profile pages are checked.

## Demo
- [ ] Start Docker/database services.
- [ ] Run only one backend process on port 4000.
- [ ] Start frontend on port 3000.
- [ ] Demonstrate login and role permissions.
- [ ] Demonstrate patient/doctor/appointment workflow.
- [ ] Demonstrate prescription and invoice/payment workflow.
- [ ] Capture screenshots for report.
- [ ] Document known limitations honestly.
