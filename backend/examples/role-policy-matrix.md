# Suggested role policy matrix

This is a **starting policy to review**, not a claim that every hospital should use exactly these permissions. Confirm with your requirements before applying.

| Module/action | ADMIN | DOCTOR | RECEPTIONIST | NURSE | PATIENT |
|---|---:|---:|---:|---:|---:|
| Doctors: list/details | Yes | Yes | Yes | Yes | Limited public directory |
| Doctors: create/update/delete | Yes | No | No | No | No |
| Departments: list/details | Yes | Yes | Yes | Yes | Limited |
| Departments: create/update/delete | Yes | No | No | No | No |
| Patients: create | Yes | No | Yes | No | Self-registration only if supported |
| Patients: list all | Yes | Assigned only | Yes | Assigned only | No |
| Patients: view/update own profile | Yes | Assigned patient data only | Operational fields only | Care-related fields only | Own profile only |
| Appointments: schedule | Yes | Limited | Yes | No/limited | Own appointment requests only |
| Appointments: view | Yes | Assigned only | Yes | Assigned only | Own only |
| Appointments: change status | Yes | Assigned only | Scheduling statuses only | Care workflow only | Cancel own if policy permits |
| Medical records: create/update | Yes (audited) | Assigned patients | No | Only specifically authorized nursing notes | No |
| Medical records: read | Authorized care team | Assigned patients | Minimum necessary | Assigned patients | Own only |
| Prescriptions: create/update | No by default | Assigned patients | No | No | No |
| Prescriptions: read | Authorized care team | Assigned patients | Minimum necessary | Minimum necessary | Own only |
| Medications catalogue: list | Yes | Yes | Yes | Yes | Usually no |
| Medications catalogue: write | Yes | No | No | No | No |
| Invoices: create/update | Yes | No/limited | Yes | No | No |
| Invoices: read | Yes | No/limited | Yes | No | Own only |
| Payments: create/refund | Authorized billing admin | No | Collect payments if authorized | No | Self-payment flow only |
| Payments: read | Yes | No/limited | Yes | No | Own only |

## Implementation notes
- A role guard checks role only. It does not verify the record belongs to the caller.
- For `PATIENT`, map `request.user.id` to `Patient.userId`, then filter the query by that patient ID.
- For `DOCTOR`, map `request.user.id` to `Doctor.userId`, then verify that the doctor is related to the requested appointment/record.
- For list routes, use database filters, not “fetch everything and hide it in the frontend”.
- Keep medical records, diagnoses, and payments private by default.
