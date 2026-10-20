"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";

export default function DashboardPage() {
  const [stats,setStats] = useState({patients:0,doctors:0,appointments:0,departments:0});
  const [appointments,setAppointments] = useState<any[]>([]);
  const [error,setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<any[]>("/patients"), api<any[]>("/doctors"), api<any[]>("/appointments"), api<any[]>("/departments")
    ]).then(([p,d,a,dep]) => {
      setStats({patients:p?.length||0,doctors:d?.length||0,appointments:a?.length||0,departments:dep?.length||0});
      setAppointments((a||[]).slice(0,6));
    }).catch(e=>setError(e.message));
  },[]);

  return <Layout><div className="page">
    <div className="page-header"><div><h1 className="page-title">Dashboard</h1><p className="page-subtitle">Overview of MediCore hospital operations.</p></div></div>
    {error && <div className="alert alert-error">{error}</div>}
    <div className="grid grid-4">
      {[
        ["🧑‍🤝‍🧑","Patients",stats.patients,"/patients"],
        ["👨‍⚕️","Doctors",stats.doctors,"/doctors"],
        ["📅","Appointments",stats.appointments,"/appointments"],
        ["🏢","Departments",stats.departments,"/departments"]
      ].map(([icon,label,value,href])=><Link href={href as string} className="card stat-card" key={label as string}><div><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div><div className="stat-icon">{icon}</div></Link>)}
    </div>
    <div className="grid grid-2" style={{marginTop:18}}>
      <div className="card"><div className="page-header" style={{marginBottom:8}}><div><h2 style={{margin:0}}>Recent Appointments</h2><p className="page-subtitle">Latest scheduled visits.</p></div><Link className="btn btn-secondary" href="/appointments">View all</Link></div>
        {appointments.length===0?<div className="empty">No appointments yet.</div>:<div className="table-wrap"><table><thead><tr><th>ID</th><th>Date</th><th>Type</th><th>Status</th></tr></thead><tbody>{appointments.map(a=><tr key={a.id}><td>#{a.id}</td><td>{new Date(a.appointmentDate).toLocaleString()}</td><td>{a.type}</td><td><span className="badge badge-info">{a.status}</span></td></tr>)}</tbody></table></div>}
      </div>
      <div className="card"><h2 style={{marginTop:0}}>Quick Actions</h2><div className="grid grid-2">
        <Link className="btn btn-primary" href="/patients">＋ Add Patient</Link>
        <Link className="btn btn-primary" href="/appointments">＋ Appointment</Link>
        <Link className="btn btn-secondary" href="/medical-records">Medical Records</Link>
        <Link className="btn btn-secondary" href="/invoices">Billing</Link>
      </div></div>
    </div>
  </div></Layout>;
}
