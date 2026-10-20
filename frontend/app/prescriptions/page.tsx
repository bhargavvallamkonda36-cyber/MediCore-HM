
"use client";

import { useCallback, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { api } from "../../lib/api";

type Prescription = {
  id: number;
  patientId: number;
  doctorId: number;
  diagnosis?: string | null;
  instructions?: string | null;
};

type PrescriptionForm = {
  patientId: string;
  doctorId: string;
  diagnosis: string;
  instructions: string;
};

const initialForm: PrescriptionForm = {
  patientId: "",
  doctorId: "",
  diagnosis: "",
  instructions: "",
};

export default function PrescriptionsPage() {
  const [rows, setRows] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PrescriptionForm>(initialForm);

  const loadPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api<any>("/prescriptions");

      const data: Prescription[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setRows(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load prescriptions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPrescriptions();
  }, [loadPrescriptions]);

  function handleChange(
    field: keyof PrescriptionForm,
    value: string,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function openModal() {
    setForm({ ...initialForm });
    setError("");
    setSuccess("");
    setOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setOpen(false);
    setForm({ ...initialForm });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const patientId = Number(form.patientId);
    const doctorId = Number(form.doctorId);

    if (
      !Number.isInteger(patientId) ||
      patientId <= 0 ||
      !Number.isInteger(doctorId) ||
      doctorId <= 0
    ) {
      setError("Enter valid Patient ID and Doctor ID values.");
      return;
    }

    try {
      setSaving(true);

      await api("/prescriptions", {
        method: "POST",
        body: JSON.stringify({
          patientId,
          doctorId,
          diagnosis: form.diagnosis.trim() || undefined,
          instructions: form.instructions.trim() || undefined,
        }),
      });

      setOpen(false);
      setForm({ ...initialForm });
      setSuccess("Prescription created successfully.");

      await loadPrescriptions();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create prescription.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm(`Delete prescription #${id}?`)) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      await api(`/prescriptions/${id}`, {
        method: "DELETE",
      });

      setSuccess(`Prescription #${id} deleted successfully.`);
      await loadPrescriptions();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete prescription.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Layout>
      <div className="page">
        {/* Page heading */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Prescriptions</h1>
            <p className="page-subtitle">
              Doctor prescriptions and treatment instructions.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openModal}
          >
            + New Prescription
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            style={{
              padding: "14px 18px",
              marginBottom: 16,
              borderRadius: 12,
              color: "#166534",
              background: "#ecfdf3",
              border: "1px solid #bbf7d0",
            }}
          >
            {success}
          </div>
        )}

        {/* Prescriptions table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient ID</th>
                <th>Doctor ID</th>
                <th>Diagnosis</th>
                <th>Instructions</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="empty">
                    Loading prescriptions...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty">
                    No prescriptions found. Click{" "}
                    <strong>New Prescription</strong> to add one.
                  </td>
                </tr>
              ) : (
                rows.map((prescription) => (
                  <tr key={prescription.id}>
                    <td>#{prescription.id}</td>
                    <td>{prescription.patientId}</td>
                    <td>{prescription.doctorId}</td>
                    <td>{prescription.diagnosis || "—"}</td>
                    <td>{prescription.instructions || "—"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: "7px 10px" }}
                        disabled={deletingId === prescription.id}
                        onClick={() =>
                          void handleDelete(prescription.id)
                        }
                      >
                        {deletingId === prescription.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create prescription modal */}
        {open && (
          <div
            className="modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="prescription-title"
            >
              <div className="modal-header">
                <div>
                  <h2
                    id="prescription-title"
                    style={{ margin: 0 }}
                  >
                    New Prescription
                  </h2>

                  <p
                    className="page-subtitle"
                    style={{ marginTop: 6, marginBottom: 0 }}
                  >
                    Enter patient and treatment details.
                  </p>
                </div>

                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Close modal"
                  disabled={saving}
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="patientId">
                      Patient ID *
                    </label>

                    <input
                      id="patientId"
                      type="number"
                      min="1"
                      step="1"
                      required
                      placeholder="Enter patient ID"
                      value={form.patientId}
                      onChange={(event) =>
                        handleChange("patientId", event.target.value)
                      }
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="doctorId">
                      Doctor ID *
                    </label>

                    <input
                      id="doctorId"
                      type="number"
                      min="1"
                      step="1"
                      required
                      placeholder="Enter doctor ID"
                      value={form.doctorId}
                      onChange={(event) =>
                        handleChange("doctorId", event.target.value)
                      }
                    />
                  </div>

                  <div className="field full">
                    <label htmlFor="diagnosis">
                      Diagnosis
                    </label>

                    <input
                      id="diagnosis"
                      type="text"
                      placeholder="e.g. Seasonal allergies"
                      value={form.diagnosis}
                      onChange={(event) =>
                        handleChange("diagnosis", event.target.value)
                      }
                    />
                  </div>

                  <div className="field full">
                    <label htmlFor="instructions">
                      Instructions
                    </label>

                    <textarea
                      id="instructions"
                      rows={4}
                      placeholder="Enter treatment and follow-up instructions"
                      value={form.instructions}
                      onChange={(event) =>
                        handleChange("instructions", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    marginTop: 20,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={saving}
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Creating..." : "Create Prescription"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

