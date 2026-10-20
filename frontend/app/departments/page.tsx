import Layout from "../../components/Layout";
import CrudPage from "../../components/CrudPage";

export default function Page() {
return (
<Layout>
<CrudPage
title="Departments"
endpoint="/departments"
fields={[
{
name: "name",
label: "Department Name",
required: true,
},
{
name: "description",
label: "Description",
type: "textarea",
},
{
name: "location",
label: "Location",
},
]}
columns={[
{
key: "id",
label: "ID",
},
{
key: "name",
label: "Department Name",
},
{
key: "description",
label: "Description",
},
{
key: "location",
label: "Location",
},
]}
/>
</Layout>
);
}
