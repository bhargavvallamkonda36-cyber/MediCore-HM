import Layout from "../../components/Layout";
import CrudPage from "../../components/CrudPage";

export default function Page() {
return (
<Layout>
<CrudPage
title="Medications"
endpoint="/medications"
fields={[
{
name: "name",
label: "Medicine Name",
required: true,
},
{
name: "genericName",
label: "Generic Name",
},
{
name: "manufacturer",
label: "Manufacturer",
},
{
name: "description",
label: "Description",
type: "textarea",
},
]}
columns={[
{ key: "id", label: "ID" },
{ key: "name", label: "Name" },
{ key: "genericName", label: "Generic Name" },
{ key: "manufacturer", label: "Manufacturer" },
]}
/>
</Layout>
);
}
