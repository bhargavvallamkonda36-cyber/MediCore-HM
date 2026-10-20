"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Protected from "./Protected";
import { getUser, logout } from "../lib/api";

const groups = [
  {
    title: "Main",
    items: [
      ["📊", "Dashboard", "/dashboard"],
      ["📅", "Appointments", "/appointments"],
    ],
  },
  {
    title: "Hospital",
    items: [
      ["👨‍⚕️", "Doctors", "/doctors"],
      ["🏢", "Departments", "/departments"],
      ["🧑‍🤝‍🧑", "Patients", "/patients"],
    ],
  },
  {
    title: "Clinical",
    items: [
      ["🩺", "Medical Records", "/medical-records"],
      ["💊", "Medications", "/medications"],
      ["💉", "Prescriptions", "/prescriptions"],
    ],
  },
  {
    title: "Finance",
    items: [
      ["🧾", "Invoices", "/invoices"],
      ["💳", "Payments", "/payments"],
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => setUser(getUser()), []);

  return (
    <Protected>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">Medi<span>Core</span></div>
        {groups.map((group) => (
          <div key={group.title}>
            <div className="nav-section">{group.title}</div>
            {group.items.map(([icon, label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`}
              >
                <span>{icon}</span><span>{label}</span>
              </Link>
            ))}
          </div>
        ))}
        <div className="nav-section">Account</div>
        <Link href="/profile" className={`nav-link ${pathname.startsWith("/profile") ? "active" : ""}`}>👤 Profile</Link>
        <button className="nav-link" style={{width:"100%",border:0,background:"transparent",textAlign:"left"}} onClick={logout}>🚪 Logout</button>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(!open)}>☰</button>
          <div>
            <strong>MediCore Hospital Management</strong>
          </div>
          <div className="user-menu">
            <div>
              <div style={{fontWeight:800,fontSize:13}}>{user?.firstName || "User"} {user?.lastName || ""}</div>
              <div style={{fontSize:11,color:"#667085"}}>{user?.role || "PATIENT"}</div>
            </div>
            <div className="avatar">{(user?.firstName || "U")[0]}</div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </Protected>
  );
}
