# MediCore RBAC Testing Checklist

## Build
- [ ] Run `npm run build` from `D:\MediCore\backend`.
- [ ] Resolve compile errors before starting the app.
- [ ] Run only one backend instance on port 4000.

## Authentication and authorization
- [ ] Protected endpoint without a token returns 401.
- [ ] Invalid/expired token returns 401.
- [ ] Authenticated user with a disallowed role receives 403 on a role-restricted endpoint.
- [ ] Allowed roles can access permitted operations.
- [ ] Confirm your JwtAuthGuard sets `request.user.role`; RolesGuard depends on it.

## Regression
- [ ] Dashboard still loads at `http://localhost:3000/dashboard`.
- [ ] Test Departments, Patients, Doctors, Appointments, Medical Records, Medications, Prescriptions, Invoices, and Payments.
- [ ] Test create/update/delete only with the intended roles.
- [ ] Use fake/test patient data, not real patient data.

## Status code reminder
- 401 = missing/invalid authentication.
- 403 = authenticated but not permitted.
- 404 = requested route not found.
