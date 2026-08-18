'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Inventory } from '@/types/inventory';

interface DeleteInventoryDialogProps {
  inventory: Inventory | null;
  deleting?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteInventoryDialog({
  inventory,
  deleting = false,
  onCancel,
  onConfirm,
}: DeleteInventoryDialogProps) {
  if (!inventory) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close delete confirmation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mt-5 text-lg font-bold text-gray-900">Delete inventory record?</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Are you sure you want to delete inventory record <span className="font-semibold text-gray-800">#{inventory.inventory_id}</span>? This action will call the backend DELETE API and cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
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
            {deleting ? 'Deleting...' : 'Delete Record'}
          </button>
        </div>
      </div>
    </div>
  );
}
