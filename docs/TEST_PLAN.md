# MediCore HMS — Test Plan

## API authorization
- Missing token on protected route: expect `401`.
- Malformed/expired token: expect `401`.
- Authenticated user without an allowed role on a role-protected route: expect `403`.
- ADMIN can perform authorized doctor-management operations.
- DOCTOR/RECEPTIONIST/NURSE/PATIENT cannot perform admin-only doctor writes.
- Test allowed reads per the agreed role policy.

## Data validation
- Duplicate user email returns a conflict response.
- Duplicate doctor license number returns a conflict response.
- Unknown department ID is rejected when creating/updating a doctor.
- Negative experience years or consultation fee are rejected.
- Invalid IDs return a client error rather than an unhandled server error.

## Regression flows
1. Login as administrator.
2. Create a department if needed.
3. Add a doctor and verify it appears in the table.
4. Search the doctor by name and email.
5. Toggle active status and refresh to verify persistence.
6. Create a patient and an appointment.
7. Verify medical records and prescriptions.
8. Create an invoice and record full/partial payments.
9. Confirm dashboard counts and financial summaries.
10. Repeat relevant requests as a non-admin role to verify restrictions.

## Test evidence
Record date, role/account type (never passwords or tokens), route/page, expected result, actual result, and pass/fail. Use disposable test records in a non-production database.
