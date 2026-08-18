'use client';

import { CalendarDays, MapPin, Package, X } from 'lucide-react';
import { Inventory } from '@/types/inventory';

interface InventoryDetailsPanelProps {
  inventory: Inventory | null;
  loading?: boolean;
  onClose: () => void;
}

function badgeClasses(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'available') return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  if (normalized === 'low stock') return 'bg-amber-50 text-amber-700 ring-amber-100';
  if (normalized === 'out of stock') return 'bg-rose-50 text-rose-700 ring-rose-100';
  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

export default function InventoryDetailsPanel({
  inventory,
  loading = false,
  onClose,
}: InventoryDetailsPanelProps) {
  if (!inventory && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30" onClick={onClose}>
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Inventory Record</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {inventory ? `#${inventory.inventory_id}` : 'Loading...'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close inventory details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading || !inventory ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 text-white shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-emerald-100">Current availability</p>
                  <p className="mt-2 text-3xl font-bold">{inventory.available_quantity}</p>
                  <p className="mt-1 text-xs text-emerald-100">of {inventory.received_quantity} received units</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-3">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badgeClasses(inventory.inventory_status)}`}>
                {inventory.inventory_status}
              </span>
            </div>

            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
              <DetailRow label="Inventory ID" value={inventory.inventory_id} />
              <DetailRow label="Organization ID" value={inventory.organization_id} />
              <DetailRow label="Donation Item ID" value={inventory.donation_item_id} />
              <DetailRow label="Received Quantity" value={inventory.received_quantity} />
              <DetailRow label="Available Quantity" value={inventory.available_quantity} />
              <DetailRow label="Inventory Status" value={inventory.inventory_status} />
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Storage Location</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">{inventory.storage_location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <CalendarDays className="mt-0.5 h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Added Date</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {new Date(inventory.added_date).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-3.5">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
