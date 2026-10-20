"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../lib/api";

type FieldOption = {
label: string;
value: string;
};

type Field = {
name: string;
label: string;
type?: string;
required?: boolean;
options?: FieldOption[];
};

type Column = {
key: string;
label: string;
};

type Props = {
title: string;
endpoint: string;
fields: Field[];
columns: Column[];
createLabel?: string;
};

type Row = Record<string, any>;

function getNestedValue(row: Row, path: string): unknown {
return path.split(".").reduce<unknown>((value, key) => {
if (value === null || value === undefined || typeof value !== "object") {
return undefined;
}

return (value as Record<string, unknown>)[key];

}, row);
}

function formatValue(value: unknown, key?: string): string {
if (value === null || value === undefined || value === "") {
return "—";
}

if (typeof value === "boolean") {
return value ? "Yes" : "No";
}

if (value instanceof Date) {
return value.toLocaleDateString();
}

if (typeof value === "object") {
return JSON.stringify(value);
}

if (
typeof value === "string" &&
(key === "dateOfBirth" || key?.endsWith(".dateOfBirth"))
) {
const date = new Date(value);

if (!Number.isNaN(date.getTime())) {
  return date.toLocaleDateString();
}

}

return String(value);
}

function getErrorMessage(error: unknown): string {
return error instanceof Error
? error.message
: "Something went wrong. Please try again.";
}

function normalizeRows(data: any): Row[] {
if (Array.isArray(data)) {
return data;
}

if (Array.isArray(data?.data)) {
return data.data;
}

if (Array.isArray(data?.patients)) {
return data.patients;
}

if (Array.isArray(data?.data?.patients)) {
return data.data.patients;
}

return [];
}

export default function CrudPage({
title,
endpoint,
fields,
columns,
createLabel = "Add New",
}: Props) {
const [rows, setRows] = useState<Row[]>([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [deletingId, setDeletingId] = useState<number | null>(null);

const [error, setError] = useState("");
const [open, setOpen] = useState(false);
const [editId, setEditId] = useState<number | null>(null);
const [form, setForm] = useState<Record<string, string>>({});

const load = useCallback(async () => {
setLoading(true);
setError("");

try {
  const response = await api<any>(endpoint);
  setRows(normalizeRows(response));
} catch (err) {
  setError(getErrorMessage(err));
} finally {
  setLoading(false);
}

}, [endpoint]);

useEffect(() => {
void load();
}, [load]);

const openCreate = () => {
const initial: Record<string, string> = {};

fields.forEach((field) => {
  initial[field.name] = "";
});

setForm(initial);
setEditId(null);
setError("");
setOpen(true);

};

const openEdit = (row: Row) => {
const initial: Record<string, string> = {};

fields.forEach((field) => {
  const value = row[field.name];

  if (value === null || value === undefined) {
    initial[field.name] = "";
  } else if (field.type === "date") {
    initial[field.name] = String(value).slice(0, 10);
  } else {
    initial[field.name] = String(value);
  }
});

setForm(initial);
setEditId(Number(row.id));
setError("");
setOpen(true);

};

const closeModal = () => {
if (saving) {
return;
}

setOpen(false);
setEditId(null);

};

const save = async (event: FormEvent<HTMLFormElement>) => {
event.preventDefault();

if (saving) {
  return;
}

setSaving(true);
setError("");

try {
  const body: Record<string, unknown> = {};

  fields.forEach((field) => {
    const value = form[field.name];

    if (field.type === "number") {
      if (value === "") {
        body[field.name] = null;
      } else {
        const numberValue = Number(value);

        if (!Number.isFinite(numberValue)) {
          throw new Error(
            `${field.label} must be a valid number.`,
          );
        }

        body[field.name] = numberValue;
      }
    } else {
      body[field.name] = value === "" ? null : value;
    }
  });

  const url =
    editId !== null ? `${endpoint}/${editId}` : endpoint;

  await api(url, {
    method: editId !== null ? "PATCH" : "POST",
    body: JSON.stringify(body),
  });

  setOpen(false);
  setEditId(null);

  await load();
} catch (err) {
  setError(getErrorMessage(err));
} finally {
  setSaving(false);
}

};

const remove = async (id: number) => {
if (deletingId !== null || saving) {
return;
}

const confirmed = window.confirm(
  "Are you sure you want to delete this record?",
);

if (!confirmed) {
  return;
}

setDeletingId(id);
setError("");

try {
  await api(`${endpoint}/${id}`, {
    method: "DELETE",
  });

  await load();
} catch (err) {
  setError(getErrorMessage(err));
} finally {
  setDeletingId(null);
}

};

return (
<div className="page">
<div className="page-header">
<div>
<h1 className="page-title">{title}</h1>

      <p className="page-subtitle">
        Manage {title.toLowerCase()}.
      </p>
    </div>

    <button
      type="button"
      className="btn btn-primary"
      onClick={openCreate}
    >
      + {createLabel}
    </button>
  </div>

  {error && (
    <div className="alert alert-error" role="alert">
      {error}

      <button
        type="button"
        className="icon-btn"
        onClick={() => setError("")}
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  )}

  {loading ? (
    <div className="loading">Loading...</div>
  ) : rows.length === 0 ? (
    <div className="card empty">
      No records found. Click <b>{createLabel}</b> to add one.
    </div>
  ) : (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>
                  {formatValue(
                    getNestedValue(row, column.key),
                    column.key,
                  )}
                </td>
              ))}

              <td>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    padding: "7px 10px",
                    marginRight: 6,
                  }}
                  onClick={() => openEdit(row)}
                  disabled={saving || deletingId !== null}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ padding: "7px 10px" }}
                  onClick={() => void remove(Number(row.id))}
                  disabled={saving || deletingId !== null}
                >
                  {deletingId === Number(row.id)
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}

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
        aria-labelledby="crud-modal-title"
      >
        <div className="modal-header">
          <h2
            id="crud-modal-title"
            style={{ margin: 0 }}
          >
            {editId !== null
              ? `Edit ${title.replace(/s$/, "")}`
              : createLabel}
          </h2>

          <button
            type="button"
            className="icon-btn"
            onClick={closeModal}
            disabled={saving}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={save}>
          <div className="form-grid">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`field ${
                  field.type === "textarea" ? "full" : ""
                }`}
              >
                <label htmlFor={`field-${field.name}`}>
                  {field.label}
                  {field.required ? " *" : ""}
                </label>

                {field.options ? (
                  <select
                    id={`field-${field.name}`}
                    value={form[field.name] ?? ""}
                    required={field.required}
                    disabled={saving}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        [field.name]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select...</option>

                    {field.options.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={`field-${field.name}`}
                    value={form[field.name] ?? ""}
                    required={field.required}
                    disabled={saving}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        [field.name]: event.target.value,
                      }))
                    }
                  />
                ) : (
                  <input
                    id={`field-${field.name}`}
                    type={field.type || "text"}
                    value={form[field.name] ?? ""}
                    required={field.required}
                    disabled={saving}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        [field.name]: event.target.value,
                      }))
                    }
                  />
                )}
              </div>
            ))}
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
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editId !== null
                  ? "Update"
                  : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

);
}
