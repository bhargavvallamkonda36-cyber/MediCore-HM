# MediCore Security Integration Checklist

## A. Infrastructure
- [ ] Back up the backend source folder.
- [ ] Confirm only one backend process uses port 4000.
- [ ] `npm run build` passes before changes and after each module change.
- [ ] `GuardsModule` is registered once; avoid duplicate global providers.
- [ ] Existing `JwtAuthGuard` validates token signature and expiry.
- [ ] JWT payload includes a trustworthy `role` claim, or the guard loads current role from the database.
- [ ] Inactive users (`isActive === false`) cannot continue using protected APIs. Add this check in the JWT/authentication path.

## B. RBAC
- [ ] Every protected controller uses `JwtAuthGuard`.
- [ ] Every role-restricted route uses `RolesGuard` and `@Roles(...)`.
- [ ] Create/update/delete endpoints are limited to appropriate roles.
- [ ] A missing role claim is denied on role-restricted endpoints.
- [ ] A role not in the allowlist receives 403.
- [ ] Unauthenticated calls receive 401.
- [ ] Frontend hiding buttons is not treated as security; backend must enforce permissions.

## C. Record-level authorization
- [ ] PATIENT reads only records tied to their own `User.id` -> `Patient.userId`.
- [ ] DOCTOR reads/changes only records assigned to their `Doctor.id`, except explicitly approved admin workflows.
- [ ] Appointment access verifies patient/doctor ownership before returning details.
- [ ] Medical-record and prescription access checks patient and doctor relationships.
- [ ] Invoice/payment endpoints verify ownership before exposing billing details.
- [ ] Never trust a `patientId`, `doctorId`, `userId`, or role sent by the client without authorization checks.
- [ ] Avoid returning password hashes or unnecessary private fields.

## D. Input validation and errors
- [ ] `ValidationPipe` uses `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`.
- [ ] DTOs validate numeric IDs, positive amounts, enums, email, and string lengths.
- [ ] Do not expose stack traces or secrets in API responses.
- [ ] Use transactions for multi-table writes.
- [ ] Avoid logging passwords, JWTs, medical details, or payment secrets.

## E. Integration tests
- [ ] ADMIN allowed to create doctor; DOCTOR denied.
- [ ] Missing/expired token denied.
- [ ] Patient A cannot read Patient B's data.
- [ ] Doctor A cannot modify Doctor B's assigned records.
- [ ] Appointment -> medical record/prescription -> invoice/payment workflow works.
- [ ] Invalid IDs and invalid DTOs return 400/404 as appropriate.
- [ ] No duplicate process/listener errors.
