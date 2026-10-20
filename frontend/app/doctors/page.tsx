
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

type Department = {
  id: number;
  name: string;
};

type Doctor = {
  id: number;
  userId: number;
  departmentId: number;
  specialization: string;
  licenseNumber: string;
  experienceYears: number;
  consultationFee: string | number;
  user?: {
    firstName: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    isActive?: boolean;
  };
  department?: {
    name: string;
  };
};

type DoctorForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  departmentId: string;
  specialization: string;
  licenseNumber: string;
  experienceYears: string;
  consultationFee: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const INITIAL_FORM: DoctorForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  departmentId: "",
  specialization: "",
  licenseNumber: "",
  experienceYears: "0",
  consultationFee: "",
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<DoctorForm>(INITIAL_FORM);
  const [savingDoctor, setSavingDoctor] = useState(false);
  const [formError, setFormError] = useState("");
  const [formNotice, setFormNotice] = useState("");

  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("medicore_token")
      : null;

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/doctors`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session may have expired. Please sign in again."
            : `Failed to load doctors (${response.status}).`
        );
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : data.data;

      if (!Array.isArray(list)) {
        throw new Error("Unexpected doctors response from the server.");
      }

      setDoctors(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load doctors."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/departments`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load departments (${response.status}).`);
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : data.data;

      if (!Array.isArray(list)) {
        throw new Error("Unexpected departments response.");
      }

      setDepartments(list);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to load departments."
      );
    }
  }, []);

  useEffect(() => {
    void fetchDoctors();
    void fetchDepartments();
  }, [fetchDoctors, fetchDepartments]);

  const isDoctorActive = (doctor: Doctor) =>
    doctor.user?.isActive ?? true;

  const activeCount = doctors.filter(isDoctorActive).length;

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return doctors;

    return doctors.filter((doctor) => {
      const name =
        `${doctor.user?.firstName ?? ""} ${doctor.user?.lastName ?? ""}`;

      return [
        name,
        doctor.user?.email,
        doctor.specialization,
        doctor.department?.name,
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [doctors, search]);

  function updateForm<K extends keyof DoctorForm>(
    field: K,
    value: DoctorForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openAddForm() {
    setForm(INITIAL_FORM);
    setFormError("");
    setFormNotice("");
    setShowAddForm(true);

    if (departments.length === 0) {
      void fetchDepartments();
    }
  }

  async function handleCreateDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");
    setFormNotice("");

    const token = getToken();

    if (!token) {
      setFormError("Please sign in again before adding a doctor.");
      return;
    }

    const experienceYears = Number(form.experienceYears);
    const consultationFee = Number(form.consultationFee);
    const departmentId = Number(form.departmentId);

    if (!Number.isInteger(departmentId) || departmentId < 1) {
      setFormError("Please select a valid department.");
      return;
    }

    if (!Number.isInteger(experienceYears) || experienceYears < 0) {
      setFormError("Experience must be a non-negative whole number.");
      return;
    }

    if (!Number.isFinite(consultationFee) || consultationFee < 0) {
      setFormError("Enter a valid consultation fee.");
      return;
    }

    setSavingDoctor(true);

    try {
      const response = await fetch(`${API_URL}/doctors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          departmentId,
          specialization: form.specialization.trim(),
          licenseNumber: form.licenseNumber.trim(),
          experienceYears,
          consultationFee,
        }),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          response.status === 409
            ? "This email or license number is already registered."
            : response.status === 400 || response.status === 422
              ? `Please check your input. ${message.slice(0, 180)}`
              : response.status === 401
                ? "Your session has expired. Please sign in again."
                : response.status === 403
                  ? "You do not have permission to register doctors."
                  : `Could not register doctor (${response.status}). ${message.slice(0, 180)}`
        );
      }

      const result = await response.json();

      setFormNotice(
        result.message || "Doctor registered successfully."
      );

      await fetchDoctors();

      setForm(INITIAL_FORM);

      // Close the form after successful registration.
      setShowAddForm(false);
      setNotice("Doctor registered successfully.");
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to register doctor."
      );
    } finally {
      setSavingDoctor(false);
    }
  }

  async function toggleDoctor(doctor: Doctor) {
    const token = getToken();

    if (!token) {
      setError("Please sign in again before changing doctor status.");
      return;
    }

    const nextStatus = !isDoctorActive(doctor);

    setUpdatingId(doctor.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/doctors/${doctor.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          response.status === 401
            ? "Your session has expired. Please sign in again."
            : response.status === 403
              ? "You do not have permission to change doctor status."
              : `Could not update doctor status (${response.status}). ${message.slice(0, 160)}`
        );
      }

      setDoctors((current) =>
        current.map((item) =>
          item.id === doctor.id
            ? {
                ...item,
                user: {
                  ...item.user!,
                  isActive: nextStatus,
                },
              }
            : item
        )
      );

      setNotice(
        `${doctor.user?.firstName ?? "Doctor"} is now ${
          nextStatus ? "active" : "inactive"
        }.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update doctor status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Doctors
            </h1>
            <p className="mt-2 text-slate-500">
              Manage hospital doctors and their details.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-blue-100 px-4 py-3 text-center">
              <p className="text-xl font-bold text-blue-700">
                {doctors.length}
              </p>
              <p className="text-xs font-medium text-blue-700">Total</p>
            </div>

            <div className="rounded-xl bg-emerald-100 px-4 py-3 text-center">
              <p className="text-xl font-bold text-emerald-700">
                {activeCount}
              </p>
              <p className="text-xs font-medium text-emerald-700">
                Active
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + Add Doctor
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-5">
          <label htmlFor="doctor-search" className="sr-only">
            Search doctors
          </label>
          <input
            id="doctor-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by doctor, email, specialization, or department..."
            className={inputClass}
          />
        </div>

        {/* Feedback */}
        {notice && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void fetchDoctors()}
              className="mt-2 font-semibold underline"
            >
              Retry loading doctors
            </button>
          </div>
        )}

        {/* Doctors table */}
        {loading ? (
          <div className="rounded-xl border bg-white p-8 text-center text-slate-500">
            Loading doctors...
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-800">
              {doctors.length === 0
                ? "No doctors found"
                : "No matching doctors"}
            </h2>
            <p className="mt-2 text-slate-500">
              {doctors.length === 0
                ? "Register your first doctor using the Add Doctor button."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4">Consultation Fee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doctor) => {
                  const active = isDoctorActive(doctor);
                  const busy = updatingId === doctor.id;

                  return (
                    <tr key={doctor.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        Dr. {doctor.user?.firstName ?? `Doctor ${doctor.id}`}{" "}
                        {doctor.user?.lastName ?? ""}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {doctor.user?.email ?? "—"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {doctor.specialization}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {doctor.department?.name ?? "—"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {doctor.experienceYears} years
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        ₹
                        {Number(doctor.consultationFee).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={active}
                            aria-label={`Set Dr. ${
                              doctor.user?.firstName ?? doctor.id
                            } ${active ? "inactive" : "active"}`}
                            disabled={busy}
                            onClick={() => void toggleDoctor(doctor)}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${
                              active ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                active
                                  ? "translate-x-5"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>

                          <span className="text-xs text-slate-500">
                            {busy
                              ? "Saving..."
                              : active
                                ? "Deactivate"
                                : "Activate"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-500">
          Doctor status changes require the appropriate backend permissions.
        </p>
      </div>

      {/* Add Doctor modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingDoctor) {
              setShowAddForm(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-doctor-title"
            className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="add-doctor-title"
                  className="text-2xl font-bold text-slate-900"
                >
                  Register New Doctor
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Enter the doctor's account and professional details.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close registration form"
                disabled={savingDoctor}
                onClick={() => setShowAddForm(false)}
                className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {formError}
              </div>
            )}

            {formNotice && (
              <div
                role="status"
                className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
              >
                {formNotice}
              </div>
            )}

            <form onSubmit={handleCreateDoctor} className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-slate-800">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    First Name *
                    <input
                      required
                      minLength={2}
                      value={form.firstName}
                      onChange={(event) =>
                        updateForm("firstName", event.target.value)
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="Enter first name"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Last Name
                    <input
                      value={form.lastName}
                      onChange={(event) =>
                        updateForm("lastName", event.target.value)
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="Enter last name"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Email *
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateForm("email", event.target.value)
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="doctor@example.com"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Temporary Password *
                    <input
                      required
                      type="password"
                      minLength={8}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(event) =>
                        updateForm("password", event.target.value)
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="At least 8 characters"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                    Phone
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        updateForm("phone", event.target.value)
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="Enter phone number"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-slate-800">
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Department *
                    <select
                      required
                      value={form.departmentId}
                      onChange={(event) =>
                        updateForm("departmentId", event.target.value)
                      }
                      className={`${inputClass} mt-1`}
                    >
                      <option value="">Select department</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                    {departments.length === 0 && (
                      <span className="mt-1 block text-xs text-amber-700">
                        No departments loaded. Check the Departments API.
                      </span>
                    )}
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Specialization *
                    <input
                      required
                      value={form.specialization}
                      onChange={(event) =>
                        updateForm("specialization", event.target.value)
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="e.g. Cardiology"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                    Medical License Number *
                    <input
                      required
                      value={form.licenseNumber}
                      onChange={(event) =>
                        updateForm("licenseNumber", event.target.value)
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="Enter unique license number"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Experience (years) *
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={form.experienceYears}
                      onChange={(event) =>
                        updateForm("experienceYears", event.target.value)
                      }
                      className={`${inputClass} mt-1`}
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Consultation Fee (₹) *
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.consultationFee}
                      onChange={(event) =>
                        updateForm("consultationFee", event.target.value)
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="800"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  disabled={savingDoctor}
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingDoctor || departments.length === 0}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingDoctor ? "Registering..." : "Register Doctor"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}