# Suggested MediCore role policy

Compare this policy against your actual implementation; it is not proof that every route currently follows it.

| Resource/action | ADMIN | DOCTOR | RECEPTIONIST | NURSE | PATIENT |
|---|---|---|---|---|---|
| Manage departments | Yes | Read if needed | Read if needed | Read if needed | No |
| Register patients | Yes | No by default | Yes | No by default | No |
| List all patients | Yes | Authorized clinical access | Yes | Authorized clinical access | No |
| View patient record | Yes | Assigned/authorized patients | Minimum operational fields | Assigned/authorized patients | Own record only |
| Update patient record | Yes | Clinical fields if appropriate | Demographic fields if allowed | Clinical fields if allowed | Own approved fields only |
| Delete patient record | Restricted admin action | No | No | No | No |
| Manage appointments | Yes | Own/assigned appointments | Scheduling operations | Assigned appointments | Own appointments only |
| View medical records | Yes, audited | Assigned patients | Minimum necessary | Assigned patients | Own records subject to policy |
| Prescriptions | Yes, audited | Authorized prescribing | No clinical editing by default | As policy permits | Own prescriptions read-only |
| Invoices/payments | Yes | Limited if needed | Billing permissions | No by default | Own billing information |

Use least privilege. The backend must enforce permissions; hiding frontend buttons is not security. Validate the final policy against applicable privacy and clinical requirements before real deployment.
