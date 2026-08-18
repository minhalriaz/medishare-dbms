'use client';

import { FormEvent, useEffect, useState } from 'react';
import { X, PackagePlus, Save } from 'lucide-react';
import { Inventory, InventoryPayload } from '@/types/inventory';

interface InventoryFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  inventory?: Inventory | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: InventoryPayload) => Promise<void>;
}

type FormState = {
  organization_id: string;
  donation_item_id: string;
  received_quantity: string;
  available_quantity: string;
  storage_location: string;
  inventory_status: string;
};

const emptyForm: FormState = {
  organization_id: '',
  donation_item_id: '',
  received_quantity: '',
  available_quantity: '',
  storage_location: '',
  inventory_status: 'Available',
};

export default function InventoryFormModal({
  open,
  mode,
  inventory,
  submitting = false,
  onClose,
  onSubmit,
}: InventoryFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && inventory) {
      setForm({
        organization_id: String(inventory.organization_id),
        donation_item_id: String(inventory.donation_item_id),
        received_quantity: String(inventory.received_quantity),
        available_quantity: String(inventory.available_quantity),
        storage_location: inventory.storage_location,
        inventory_status: inventory.inventory_status || 'Available',
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
  }, [open, mode, inventory]);

  if (!open) return null;

  const setField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const organizationId = Number(form.organization_id);
    const donationItemId = Number(form.donation_item_id);
    const received = Number(form.received_quantity);
    const available = Number(form.available_quantity);

    if (!Number.isInteger(organizationId) || organizationId <= 0) {
      nextErrors.organization_id = 'Organization ID must be a positive integer.';
    }

    if (!Number.isInteger(donationItemId) || donationItemId <= 0) {
      nextErrors.donation_item_id = 'Donation Item ID must be a positive integer.';
    }

    if (!Number.isInteger(received) || received < 0) {
      nextErrors.received_quantity = 'Received Quantity must be a non-negative integer.';
    }

    if (!Number.isInteger(available) || available < 0) {
      nextErrors.available_quantity = 'Available Quantity must be a non-negative integer.';
    }

    if (
      Number.isInteger(received) &&
      Number.isInteger(available) &&
      available > received
    ) {
      nextErrors.available_quantity = 'Available Quantity cannot exceed Received Quantity.';
    }

    if (!form.storage_location.trim()) {
      nextErrors.storage_location = 'Storage Location is required.';
    }

    if (!form.inventory_status.trim()) {
      nextErrors.inventory_status = 'Inventory Status is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      organization_id: Number(form.organization_id),
      donation_item_id: Number(form.donation_item_id),
      received_quantity: Number(form.received_quantity),
      available_quantity: Number(form.available_quantity),
      storage_location: form.storage_location.trim(),
      inventory_status: form.inventory_status.trim(),
    });
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-100 ${
      hasError
        ? 'border-rose-300 focus:border-rose-400'
        : 'border-gray-200 focus:border-emerald-500'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              {mode === 'create' ? (
                <PackagePlus className="h-5 w-5" />
              ) : (
                <Save className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {mode === 'create' ? 'Add Inventory' : 'Edit Inventory'}
              </h2>
              <p className="text-xs text-gray-500">
                Inventory Information
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close inventory form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[78vh] overflow-y-auto p-6">
          {mode === 'edit' && inventory && (
            <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Inventory ID</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">#{inventory.inventory_id}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Added Date</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {new Date(inventory.added_date).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Organization ID" error={errors.organization_id}>
              <input
                type="number"
                min="1"
                step="1"
                value={form.organization_id}
                onChange={(e) => setField('organization_id', e.target.value)}
                placeholder="1"
                className={inputClass(Boolean(errors.organization_id))}
                disabled={submitting}
              />
            </Field>

            <Field label="Donation Item ID" error={errors.donation_item_id}>
              <input
                type="number"
                min="1"
                step="1"
                value={form.donation_item_id}
                onChange={(e) => setField('donation_item_id', e.target.value)}
                placeholder="1"
                className={inputClass(Boolean(errors.donation_item_id))}
                disabled={submitting}
              />
            </Field>

            <Field label="Received Quantity" error={errors.received_quantity}>
              <input
                type="number"
                min="0"
                step="1"
                value={form.received_quantity}
                onChange={(e) => setField('received_quantity', e.target.value)}
                placeholder="100"
                className={inputClass(Boolean(errors.received_quantity))}
                disabled={submitting}
              />
            </Field>

            <Field label="Available Quantity" error={errors.available_quantity}>
              <input
                type="number"
                min="0"
                step="1"
                value={form.available_quantity}
                onChange={(e) => setField('available_quantity', e.target.value)}
                placeholder="100"
                className={inputClass(Boolean(errors.available_quantity))}
                disabled={submitting}
              />
            </Field>

            <Field label="Storage Location" error={errors.storage_location}>
              <input
                type="text"
                value={form.storage_location}
                onChange={(e) => setField('storage_location', e.target.value)}
                placeholder="Shelf A-01"
                className={inputClass(Boolean(errors.storage_location))}
                disabled={submitting}
              />
            </Field>

            <Field label="Inventory Status" error={errors.inventory_status}>
              <select
                value={form.inventory_status}
                onChange={(e) => setField('inventory_status', e.target.value)}
                className={inputClass(Boolean(errors.inventory_status))}
                disabled={submitting}
              >
                {inventory?.inventory_status &&
                  !['Available', 'Low Stock', 'Out of Stock'].includes(inventory.inventory_status) && (
                    <option value={inventory.inventory_status}>{inventory.inventory_status}</option>
                  )}
                <option value="Available">Available</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </Field>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mode === 'create' ? <PackagePlus className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {submitting
                ? 'Saving...'
                : mode === 'create'
                  ? 'Add Inventory'
                  : 'Save Changes'}
            </button>
          </div>
        </form>
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
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
