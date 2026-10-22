"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, saveSession } from "../../lib/api";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("[admin@medicore.com](mailto:admin@medicore.com)");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

async function handleSubmit(e: FormEvent<HTMLFormElement>) {
e.preventDefault();


setError("");
setLoading(true);

try {
  const data = await api<{
    accessToken?: string;
    user?: unknown;
  }>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  if (!data.accessToken) {
    throw new Error(
      "Login succeeded without an access token. Please check the backend login response."
    );
  }

  saveSession(data);
  router.replace("/dashboard");
} catch (err: unknown) {
  setError(
    err instanceof Error
      ? err.message
      : "Login failed. Please check your credentials and try again."
  );
} finally {
  setLoading(false);
}


}

return ( <div className="login-page"> <div className="card login-card"> <div className="login-logo"> <div className="logo">MediCore</div>


      <div style={{ fontSize: 12, color: "#667085" }}>
        Hospital Management System
      </div>
    </div>

    <h1>Welcome back</h1>
    <p>Sign in to your hospital dashboard.</p>

    {error && (
      <div className="alert alert-error" role="alert">
        {error}
      </div>
    )}

    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="email">Email</label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="Enter your password"
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>

    <div
      style={{
        marginTop: 20,
        textAlign: "center",
        fontSize: 14,
        color: "#667085",
      }}
    >
      Don&apos;t have an account?{" "}
      <Link
        href="/register"
        style={{
          color: "#2563eb",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Create Account
      </Link>
    </div>

    <div className="login-footer">
      MediCore HMS • Secure hospital operations
    </div>
  </div>
</div>

);
}
