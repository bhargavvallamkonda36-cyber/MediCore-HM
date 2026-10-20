import Layout from "../../components/Layout";
import CrudPage from "../../components/CrudPage";

export default function Page() {
return (
<Layout>
<CrudPage
title="Payments"
endpoint="/payments"
fields={[
{
name: "invoiceId",
label: "Invoice ID",
type: "number",
required: true,
},
{
name: "amount",
label: "Amount",
type: "number",
required: true,
},
{
name: "method",
label: "Payment Method",
required: true,
options: [
{ label: "Cash", value: "CASH" },
{ label: "Card", value: "CARD" },
{ label: "UPI", value: "UPI" },
{ label: "Insurance", value: "INSURANCE" },
{ label: "Online", value: "ONLINE" },
],
},
{
name: "transactionId",
label: "Transaction ID",
},
]}
columns={[
{ key: "id", label: "ID" },
{ key: "invoiceId", label: "Invoice" },
{ key: "amount", label: "Amount" },
{ key: "method", label: "Method" },
{ key: "transactionId", label: "Transaction" },
]}
/>
</Layout>
);
}
