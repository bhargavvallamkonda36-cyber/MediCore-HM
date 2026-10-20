"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, saveSession } from "../../lib/api";

export default function RegisterPage() {
  const router=useRouter();
  const [form,setForm]=useState({firstName:"",lastName:"",email:"",password:"",phone:""});
  const [error,setError]=useState(""),[loading,setLoading]=useState(false);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setError("");try{const data=await api<any>("/auth/register",{method:"POST",auth:false,body:JSON.stringify(form)});saveSession(data);router.replace("/dashboard")}catch(e:any){setError(e.message)}finally{setLoading(false)}};
  return <div className="login-page"><div className="card login-card"><div className="login-logo"><div className="logo">MediCore</div></div><h1>Create account</h1><p>Register a new hospital user.</p>{error&&<div className="alert alert-error">{error}</div>}<form onSubmit={submit}>
    <div className="form-grid"><div className="field"><label>First Name</label><input required value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/></div><div className="field"><label>Last Name</label><input value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/></div></div>
    <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
    <div className="field"><label>Password</label><input type="password" minLength={8} required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
    <div className="field"><label>Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
    <button className="btn btn-primary" disabled={loading}>{loading?"Creating...":"Create Account"}</button>
  </form><div className="login-footer">Already registered? <Link href="/login" style={{color:"#2563eb",fontWeight:700}}>Sign in</Link></div></div></div>
}
