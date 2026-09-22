'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Pencil,
  Pill,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { medicineApi } from '@/services/medicineApi';
import { CreateMedicinePayload, Medicine, MedicineAuditRecord } from '@/types/medicine';

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

type FormState = {
  medicine_name: string;
  generic_name: string;
  manufacturer: string;
  dosage_form: string;
  strength: string;
  medicine_category: string;
  prescription_required: boolean;
};

const emptyForm: FormState = {
  medicine_name: '',
  generic_name: '',
  manufacturer: '',
  dosage_form: '',
  strength: '',
  medicine_category: '',
  prescription_required: false,
};

function formatDisplay(value?: string | null) {
  if (!value || value.trim() === '') {
    return '—';
  }

  return value;
}

function formatAuditDate(value?: string | Date | null) {
  if (!value) {
    return '—';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

function formatAuditBoolean(value?: boolean | null) {
  if (value === null || value === undefined) {
    return '—';
  }

  return value ? 'Yes' : 'No';
}

export default function MedicinePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [formOpen, setFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditRecords, setAuditRecords] = useState<MedicineAuditRecord[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((nextToast: ToastState) => {
    setToast(nextToast);

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await medicineApi.getAll();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load medicines.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMedicines();
  }, [fetchMedicines]);

  const filteredMedicines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return medicines;
    }

    return medicines.filter((medicine) => {
      const searchableText = [
        medicine.medicine_name,
        medicine.generic_name,
        medicine.manufacturer,
        medicine.dosage_form,
        medicine.strength,
        medicine.medicine_category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [medicines, searchQuery]);

  const openCreateModal = () => {
    setMode('create');
    setEditingMedicine(null);
    setFormOpen(true);
  };

  const openEditModal = (medicine: Medicine) => {
    setMode('edit');
    setEditingMedicine(medicine);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: CreateMedicinePayload) => {
    setSubmitting(true);

    try {
      if (mode === 'create') {
        await medicineApi.create(payload);
      } else if (editingMedicine) {
        await medicineApi.update(editingMedicine.medicine_id, payload);
      }

      setFormOpen(false);
      setEditingMedicine(null);
      await fetchMedicines();
      showToast({
        type: 'success',
        message:
          mode === 'create'
            ? 'Medicine created successfully.'
            : 'Medicine updated successfully.',
      });
    } catch (requestError) {
      showToast({
        type: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to save medicine.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    try {
      await medicineApi.remove(deleteTarget.medicine_id);
      setDeleteTarget(null);
      await fetchMedicines();
      showToast({
        type: 'success',
        message: 'Medicine deleted successfully.',
      });
    } catch (requestError) {
      showToast({
        type: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to delete medicine.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const fetchAuditHistory = useCallback(async () => {
    setAuditLoading(true);
    setAuditError('');

    try {
      const data = await medicineApi.getAuditHistory();
      setAuditRecords(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setAuditError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load medicine audit history.',
      );
      setAuditRecords([]);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen w-full min-w-0 bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              <Pill className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Medicine Master Data
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Medicines
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Manage medicine catalog entries used across donations and requests.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void fetchMedicines()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Add Medicine
            </button>
          </div>
        </header>

        {toast && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {toast.message}
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search medicines..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {filteredMedicines.length} medicine{filteredMedicines.length === 1 ? '' : 's'}
            </div>
          </div>
        </section>

        <section className="mb-6 w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Audit History
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Medicine change log</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchAuditHistory()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
                Refresh Audit
              </button>

              <button
                type="button"
                onClick={() => setAuditOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                {auditOpen ? 'Hide History' : 'Show History'}
              </button>
            </div>
          </div>

          {auditOpen && (
            <div className="mt-4 w-full min-w-0">
              {auditLoading ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading medicine audit history...
                </div>
              ) : auditError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {auditError}
                </div>
              ) : auditRecords.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  No medicine audit records found yet.
                </div>
              ) : (
                <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-[1280px] divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Medicine</th>
                        <th className="px-3 py-2 font-semibold">Action</th>
                        <th className="px-3 py-2 font-semibold">Changed At</th>
                        <th className="px-3 py-2 font-semibold">Changed By</th>
                        <th className="px-3 py-2 font-semibold">Old Name</th>
                        <th className="px-3 py-2 font-semibold">New Name</th>
                        <th className="px-3 py-2 font-semibold">Old Strength</th>
                        <th className="px-3 py-2 font-semibold">New Strength</th>
                        <th className="px-3 py-2 font-semibold">Old Generic</th>
                        <th className="px-3 py-2 font-semibold">New Generic</th>
                        <th className="px-3 py-2 font-semibold">Old Manufacturer</th>
                        <th className="px-3 py-2 font-semibold">New Manufacturer</th>
                        <th className="px-3 py-2 font-semibold">Old Dosage</th>
                        <th className="px-3 py-2 font-semibold">New Dosage</th>
                        <th className="px-3 py-2 font-semibold">Old Category</th>
                        <th className="px-3 py-2 font-semibold">New Category</th>
                        <th className="px-3 py-2 font-semibold">Old Rx</th>
                        <th className="px-3 py-2 font-semibold">New Rx</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                      {auditRecords.map((record) => (
                        <tr key={record.audit_id} className="align-top">
                          <td className="px-3 py-2 font-medium text-slate-900">#{record.medicine_id}</td>
                          <td className="px-3 py-2">
                            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                              {record.action_type}
                            </span>
                          </td>
                          <td className="px-3 py-2">{formatAuditDate(record.changed_at)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.changed_by)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.medicine_name_old)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.medicine_name_new)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.strength_old)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.strength_new)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.generic_name_old)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.generic_name_new)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.manufacturer_old)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.manufacturer_new)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.dosage_form_old)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.dosage_form_new)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.medicine_category_old)}</td>
                          <td className="px-3 py-2">{formatDisplay(record.medicine_category_new)}</td>
                          <td className="px-3 py-2">{formatAuditBoolean(record.prescription_required_old)}</td>
                          <td className="px-3 py-2">{formatAuditBoolean(record.prescription_required_new)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex items-center justify-center gap-3 text-slate-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading medicines...
            </div>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Pill className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No medicines found</h2>
            <p className="mt-2 text-sm text-slate-500">
              {searchQuery
                ? 'Try a different search term.'
                : 'Create the first medicine entry to get started.'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Add Medicine
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Medicine</th>
                    <th className="px-4 py-3">Generic</th>
                    <th className="px-4 py-3">Manufacturer</th>
                    <th className="px-4 py-3">Dosage</th>
                    <th className="px-4 py-3">Strength</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Prescription</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                  {filteredMedicines.map((medicine) => (
                    <tr key={medicine.medicine_id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">#{medicine.medicine_id}</td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{medicine.medicine_name}</div>
                      </td>
                      <td className="px-4 py-4">{formatDisplay(medicine.generic_name)}</td>
                      <td className="px-4 py-4">{formatDisplay(medicine.manufacturer)}</td>
                      <td className="px-4 py-4">{formatDisplay(medicine.dosage_form)}</td>
                      <td className="px-4 py-4">{formatDisplay(medicine.strength)}</td>
                      <td className="px-4 py-4">{formatDisplay(medicine.medicine_category)}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                            medicine.prescription_required
                              ? 'bg-amber-50 text-amber-700 ring-amber-200'
                              : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                          }`}
                        >
                          {medicine.prescription_required ? 'Required' : 'Not Required'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(medicine)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(medicine)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {formOpen && (
        <MedicineFormModal
          mode={mode}
          medicine={editingMedicine}
          submitting={submitting}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <DeleteMedicineDialog
          medicine={deleteTarget}
          deleting={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function MedicineFormModal({
  mode,
  medicine,
  submitting,
  onClose,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  medicine: Medicine | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMedicinePayload) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && medicine) {
      setForm({
        medicine_name: medicine.medicine_name || '',
        generic_name: medicine.generic_name || '',
        manufacturer: medicine.manufacturer || '',
        dosage_form: medicine.dosage_form || '',
        strength: medicine.strength || '',
        medicine_category: medicine.medicine_category || '',
        prescription_required: !!medicine.prescription_required,
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
  }, [mode, medicine]);

  const setField = (field: keyof FormState, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: '',
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.medicine_name.trim()) {
      nextErrors.medicine_name = 'Medicine name is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      medicine_name: form.medicine_name.trim(),
      generic_name: form.generic_name.trim() || undefined,
      manufacturer: form.manufacturer.trim() || undefined,
      dosage_form: form.dosage_form.trim() || undefined,
      strength: form.strength.trim() || undefined,
      medicine_category: form.medicine_category.trim() || undefined,
      prescription_required: form.prescription_required,
    });
  };

  const inputClass = (fieldName: keyof FormState) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-emerald-100 ${
      errors[fieldName]
        ? 'border-rose-300 focus:border-rose-400'
        : 'border-slate-200 focus:border-emerald-500'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              {mode === 'create' ? <Plus className="h-5 w-5" /> : <Save className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {mode === 'create' ? 'Add Medicine' : 'Edit Medicine'}
              </h2>
              <p className="text-xs text-slate-500">Medicine details</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close medicine form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[78vh] overflow-y-auto p-6">
          {mode === 'edit' && medicine && (
            <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Medicine ID</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">#{medicine.medicine_id}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Prescription Status</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {medicine.prescription_required ? 'Required' : 'Not Required'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Medicine Name" error={errors.medicine_name}>
              <input
                type="text"
                value={form.medicine_name}
                onChange={(event) => setField('medicine_name', event.target.value)}
                placeholder="Amoxicillin"
                className={inputClass('medicine_name')}
                disabled={submitting}
              />
            </Field>

            <Field label="Generic Name" error={errors.generic_name}>
              <input
                type="text"
                value={form.generic_name}
                onChange={(event) => setField('generic_name', event.target.value)}
                placeholder="Amoxicillin"
                className={inputClass('generic_name')}
                disabled={submitting}
              />
            </Field>

            <Field label="Manufacturer" error={errors.manufacturer}>
              <input
                type="text"
                value={form.manufacturer}
                onChange={(event) => setField('manufacturer', event.target.value)}
                placeholder="MedPlus"
                className={inputClass('manufacturer')}
                disabled={submitting}
              />
            </Field>

            <Field label="Dosage Form" error={errors.dosage_form}>
              <input
                type="text"
                value={form.dosage_form}
                onChange={(event) => setField('dosage_form', event.target.value)}
                placeholder="Capsule"
                className={inputClass('dosage_form')}
                disabled={submitting}
              />
            </Field>

            <Field label="Strength" error={errors.strength}>
              <input
                type="text"
                value={form.strength}
                onChange={(event) => setField('strength', event.target.value)}
                placeholder="500mg"
                className={inputClass('strength')}
                disabled={submitting}
              />
            </Field>

            <Field label="Category" error={errors.medicine_category}>
              <input
                type="text"
                value={form.medicine_category}
                onChange={(event) => setField('medicine_category', event.target.value)}
                placeholder="Antibiotic"
                className={inputClass('medicine_category')}
                disabled={submitting}
              />
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Prescription required</p>
              <p className="text-xs text-slate-500">Toggle whether this medicine requires a prescription.</p>
            </div>

            <button
              type="button"
              onClick={() => setField('prescription_required', !form.prescription_required)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                form.prescription_required ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle prescription required"
              disabled={submitting}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  form.prescription_required ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {mode === 'create' ? <Plus className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {mode === 'create' ? 'Create Medicine' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteMedicineDialog({
  medicine,
  deleting,
  onCancel,
  onConfirm,
}: {
  medicine: Medicine | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  if (!medicine) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Trash2 className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close delete confirmation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">Delete medicine?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete <span className="font-semibold text-slate-800">{medicine.medicine_name}</span>?
          This action will call the backend DELETE API and cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete Medicine'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-2 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}
