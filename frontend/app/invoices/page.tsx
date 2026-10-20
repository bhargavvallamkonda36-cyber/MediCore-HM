import Layout from "../../components/Layout";
import CrudPage from "../../components/CrudPage";

export default function Page() {
return (
<Layout>
<CrudPage
title="Invoices"
endpoint="/invoices"
fields={[
{
name: "patientId",
label: "Patient ID",
type: "number",
required: true,
},
{
name: "appointmentId",
label: "Appointment ID",
type: "number",
},
{
name: "invoiceNumber",
label: "Invoice Number",
required: true,
},
{
name: "consultationFee",
label: "Consultation Fee",
type: "number",
},
{
name: "medicationFee",
label: "Medication Fee",
type: "number",
},
{
name: "labFee",
label: "Lab Fee",
type: "number",
},
{
name: "otherCharges",
label: "Other Charges",
type: "number",
},
{
name: "discount",
label: "Discount",
type: "number",
},
{
name: "totalAmount",
label: "Total Amount",
type: "number",
required: true,
},
]}
columns={[
{ key: "id", label: "ID" },
{ key: "invoiceNumber", label: "Invoice" },
{ key: "patientId", label: "Patient" },
{ key: "totalAmount", label: "Total" },
{ key: "paidAmount", label: "Paid" },
{ key: "status", label: "Status" },
]}
/>
</Layout>
);
}
