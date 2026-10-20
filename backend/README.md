# MediCore HMS — RBAC, Data Protection & Testing Pack

This is a **safe integration pack** for the current MediCore project. It provides reusable role-based access control files, example controller patterns, a permission matrix, security guidance, and a PowerShell smoke-test script.

## Important scope note
Your existing project files were not uploaded as a complete source tree, so this pack does **not** blindly replace all controllers/services. That could break working endpoints or invent ownership rules that do not match your schema. Use the examples as controlled integration patches. Back up the project first.

Expected project:
- `D:\MediCore\backend`
- NestJS + Prisma 7
- Generated Prisma client: `src/generated/prisma`
- Roles: `ADMIN`, `DOCTOR`, `RECEPTIONIST`, `NURSE`, `PATIENT`
- API port: `4000`

## Pack contents
- `src/guards/roles.decorator.ts` — `@Roles(...)`
- `src/guards/roles.guard.ts` — checks `request.user.role`
- `src/guards/guards.module.ts` — exports `RolesGuard`
- `examples/doctors.controller.rbac.example.ts` — safe example based on the controller you shared
- `examples/role-policy-matrix.md` — suggested permissions by module
- `examples/patient-data-protection.service-pattern.ts` — ownership-check pattern; adapt to your exact service and DTOs
- `examples/main-validation.patch.ts` — validation bootstrap snippet
- `tests/rbac-smoke-test.ps1` — simple endpoint smoke tests
- `CHECKLIST.md` — integration and verification checklist

## Installation
1. Back up `D:\MediCore\backend\src` (copy it to a safe folder).
2. Extract this ZIP.
3. Copy `src\guards\roles.decorator.ts`, `src\guards\roles.guard.ts`, and `src\guards\guards.module.ts` into `D:\MediCore\backend\src\guards`, merging rather than replacing your existing `jwt-auth.guard.ts`.
4. Keep your existing `JwtAuthGuard`. This pack does not replace or configure JWT.
5. Ensure `GuardsModule` is imported in `src/app.module.ts` if you use its global provider. Do not replace your existing `app.module.ts` with an example.
6. Add `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(...)` to each controller route according to the policy matrix. If a controller already has a class-level `@UseGuards(JwtAuthGuard)`, add `RolesGuard` without removing JWT authentication.
7. Check the JWT guard attaches the decoded role to `request.user.role`. The JWT payload must include a trusted role from the database; do not accept a role supplied by request body or query string.
8. Run the tests below.

## Build and run
In a terminal:
```powershell
cd D:\MediCore\backend
npm run build
```
If build succeeds:
```powershell
npm run start:dev
```
Keep only one backend process listening on port 4000. If `EADDRINUSE` appears, do not start another copy. Identify the current listener with:
```powershell
netstat -ano | findstr :4000
```

Frontend (separate terminal):
```powershell
cd D:\MediCore\frontend
npm run dev
```

## Smoke test
1. Log in through your existing UI/API as each test role and copy the access token.
2. Run:
```powershell
cd D:\MediCore\backend
.\tests\rbac-smoke-test.ps1 -BaseUrl "http://localhost:4000" -AdminToken "<ADMIN_TOKEN>" -DoctorToken "<DOCTOR_TOKEN>"
```
Adjust endpoint payloads and IDs to match your seeded data. The script checks status codes only; it does not create or delete records.

## Privacy / authorization warning
RBAC is not the same as record-level ownership. A patient-role user should not be able to read another patient's medical record merely because both have `PATIENT` role. For patient/doctor access, add ownership checks inside services using authenticated user ID and database relations. Do not expose full medical records to all staff by default. Follow your institution's privacy requirements.
