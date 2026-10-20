"use client";

import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";

export default function ProfilePage() {
  const [user,setUser]=useState<any>(null),[error,setError]=useState("");
  useEffect(()=>{api<any>("/auth/profile").then(setUser).catch(e=>setError(e.message))},[]);
  return <Layout><div className="page"><div className="page-header"><div><h1 className="page-title">My Profile</h1><p className="page-subtitle">Your MediCore account information.</p></div></div>
    {error&&<div className="alert alert-error">{error}</div>}
    <div className="card" style={{maxWidth:700}}>{user?<div className="form-grid">
      {Object.entries(user).filter(([k])=>k!=="passwordHash").map(([k,v])=><div className="field" key={k}><label>{k}</label><input readOnly value={String(v??"")}/></div>)}
    </div>:!error&&<div className="loading">Loading profile...</div>}</div>
  </div></Layout>
}
