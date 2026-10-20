import Layout from "../../components/Layout";
import CrudPage from "../../components/CrudPage";

export default function Page() {
return (
<Layout>
<CrudPage
title="Medical Records"
endpoint="/medical-records"
fields={[
{
name: "patientId",
label: "Patient ID",
type: "number",
required: true,
},
{
name: "doctorId",
label: "Doctor ID",
type: "number",
required: true,
},
{
name: "appointmentId",
label: "Appointment ID",
type: "number",
},
{
name: "recordType",
label: "Record Type",
required: true,
options: [
{ label: "Consultation", value: "CONSULTATION" },
{ label: "Diagnosis", value: "DIAGNOSIS" },
{ label: "Lab Report", value: "LAB_REPORT" },
{ label: "Imaging", value: "IMAGING" },
{ label: "Procedure", value: "PROCEDURE" },
{ label: "Other", value: "OTHER" },
],
},
{
name: "diagnosis",
label: "Diagnosis",
},
{
name: "symptoms",
label: "Symptoms",
},
{
name: "treatment",
label: "Treatment",
},
{
name: "notes",
label: "Notes",
type: "textarea",
},
]}
columns={[
{ key: "id", label: "ID" },
{ key: "patientId", label: "Patient" },
{ key: "doctorId", label: "Doctor" },
{ key: "recordType", label: "Type" },
{ key: "diagnosis", label: "Diagnosis" },
]}
/>
</Layout>
);
}
