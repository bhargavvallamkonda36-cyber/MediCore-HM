"use client";

import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";

const types = ["CONSULTATION","FOLLOW_UP","EMERGENCY","CHECKUP"];

export default function AppointmentsPage() {
  const [rows,setRows]=useState<any[]>([]);
  const [form,setForm]=useState<any>({patientId:"",doctorId:"",appointmentDate:"",type:"CONSULTATION",reason:"",notes:""});
  const [open,setOpen]=useState(false),[error,setError]=useState(""),[loading,setLoading]=useState(true);

  const load=async()=>{try{setLoading(true);setRows(await api<any[]>("/appointments"));}catch(e:any){setError(e.message)}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);

  const save=async(e:React.FormEvent)=>{
    e.preventDefault();setError("");
    try{
      await api("/appointments",{method:"POST",body:JSON.stringify({...form,patientId:Number(form.patientId),doctorId:Number(form.doctorId)})});
      setOpen(false);setForm({patientId:"",doctorId:"",appointmentDate:"",type:"CONSULTATION",reason:"",notes:""});load();
    }catch(e:any){setError(e.message)}
  };
  const del=async(id:number)=>{if(!confirm("Delete appointment?"))return;try{await api(`/appointments/${id}`,{method:"DELETE"});load()}catch(e:any){setError(e.message)}};

  return <Layout><div className="page">
    <div className="page-header"><div><h1 className="page-title">Appointments</h1><p className="page-subtitle">Schedule and manage patient appointments.</p></div><button className="btn btn-primary" onClick={()=>setOpen(true)}>＋ New Appointment</button></div>
    {error&&<div className="alert alert-error">{error}</div>}
    {loading?<div className="loading">Loading...</div>:<div className="table-wrap"><table><thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {rows.length===0?<tr><td colSpan={7} className="empty">No appointments found.</td></tr>:rows.map(a=><tr key={a.id}><td>#{a.id}</td><td>{a.patientId}</td><td>{a.doctorId}</td><td>{new Date(a.appointmentDate).toLocaleString()}</td><td>{a.type}</td><td><span className="badge badge-info">{a.status}</span></td><td><button className="btn btn-danger" style={{padding:"7px 10px"}} onClick={()=>del(a.id)}>Delete</button></td></tr>)}
    </tbody></table></div>}
    {open&&<div className="modal-backdrop"><div className="modal"><div className="modal-header"><h2 style={{margin:0}}>New Appointment</h2><button className="icon-btn" onClick={()=>setOpen(false)}>✕</button></div>
      <form onSubmit={save}><div className="form-grid">
        <div className="field"><label>Patient ID *</label><input type="number" value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})} required/></div>
        <div className="field"><label>Doctor ID *</label><input type="number" value={form.doctorId} onChange={e=>setForm({...form,doctorId:e.target.value})} required/></div>
        <div className="field"><label>Date & Time *</label><input type="datetime-local" value={form.appointmentDate} onChange={e=>setForm({...form,appointmentDate:e.target.value})} required/></div>
        <div className="field"><label>Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{types.map(x=><option key={x}>{x}</option>)}</select></div>
        <div className="field full"><label>Reason</label><input value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/></div>
        <div className="field full"><label>Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
      </div><div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20}}><button type="button" className="btn btn-secondary" onClick={()=>setOpen(false)}>Cancel</button><button className="btn btn-primary">Create</button></div></form>
    </div></div>}
  </div></Layout>
}
