import Layout from "../../components/Layout";
import CrudPage from "../../components/CrudPage";

export default function PatientsPage() {
  return (
    <Layout>
      <CrudPage
        title="Patients"
        endpoint="/patients"
        createLabel="Add Patient"
        fields={[
          {
            name: "firstName",
            label: "First Name",
            required: true,
          },
          {
            name: "lastName",
            label: "Last Name",
          },
          {
            name: "email",
            label: "Email Address",
            type: "email",
            required: true,
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            required: true,
          },
          {
            name: "phone",
            label: "Phone Number",
          },
          {
            name: "dateOfBirth",
            label: "Date of Birth",
            type: "date",
            required: true,
          },
          {
            name: "gender",
            label: "Gender",
            required: true,
            options: [
              { label: "Male", value: "MALE" },
              { label: "Female", value: "FEMALE" },
              { label: "Other", value: "OTHER" },
            ],
          },
          {
            name: "bloodGroup",
            label: "Blood Group",
          },
          {
            name: "address",
            label: "Address",
          },
          {
            name: "emergencyContact",
            label: "Emergency Contact",
          },
          {
            name: "emergencyPhone",
            label: "Emergency Phone",
          },
          {
            name: "allergies",
            label: "Allergies",
          },
          {
            name: "medicalHistory",
            label: "Medical History",
            type: "textarea",
          },
        ]}
        columns={[
          { key: "id", label: "Patient ID" },
          { key: "user.firstName", label: "First Name" },
          { key: "user.lastName", label: "Last Name" },
          { key: "user.email", label: "Email" },
          { key: "dateOfBirth", label: "Date of Birth" },
          { key: "gender", label: "Gender" },
          { key: "bloodGroup", label: "Blood Group" },
        ]}
      />
    </Layout>
  );
}
