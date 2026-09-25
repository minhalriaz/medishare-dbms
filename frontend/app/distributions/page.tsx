'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { distributionApi } from '@/services/distributionApi';
import { Distribution } from '@/types/distribution';
import {
  AlertCircle,
  Boxes,
  Eye,
  PackageCheck,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  X,
} from 'lucide-react';

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

const statusOptions = ['All', 'Pending', 'In Transit', 'Completed', 'Cancelled'];

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

function statusBadgeClasses(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    case 'in transit':
      return 'bg-sky-50 text-sky-700 ring-sky-100';
    case 'pending':
      return 'bg-amber-50 text-amber-700 ring-amber-100';
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 ring-rose-100';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200';
  }
}

export default function DistributionsPage() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState<Distribution | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Distribution | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((nextToast: ToastState) => {
    setToast(nextToast);
    if (nextToast) {
      window.setTimeout(() => setToast(null), 3500);
    }
  }, []);

  const fetchDistributions = useCallback(async () => {
    setLoading(true);

    try {
      const data = await distributionApi.getAll();
      setDistributions(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to load distributions.',
      });
      setDistributions([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDistributions();
  }, [fetchDistributions]);

  const summary = useMemo(() => {
    return distributions.reduce(
      (totals, item) => {
        totals.records += 1;
        const status = (item.distribution_status || '').toLowerCase();
        if (status === 'pending') totals.pending += 1;
        if (status === 'in transit') totals.inTransit += 1;
        if (status === 'completed') totals.completed += 1;
        return totals;
      },
      { records: 0, pending: 0, inTransit: 0, completed: 0 },
    );
  }, [distributions]);

  const filteredDistributions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return distributions.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.distribution_id).includes(query) ||
        String(item.request_id).includes(query) ||
        String(item.distributed_by_organization_id).includes(query) ||
        String(item.received_by || '').toLowerCase().includes(query) ||
        String(item.distribution_status || '').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'All' || item.distribution_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [distributions, searchQuery, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await distributionApi.remove(deleteTarget.distribution_id);
      showToast({ type: 'success', message: 'Distribution deleted successfully.' });
      setDeleteTarget(null);
      await fetchDistributions();
    } catch (error) {
      showToast({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to delete distribution.',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <Sidebar />

      <main className="min-h-screen px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1500px]">
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Dashboard / Distributions</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Distributions
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Track how medicine requests are fulfilled and delivered by organization.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingDistribution(null);
                setFormOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              New Distribution
            </button>
          </header>

          <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Distributions" value={summary.records} icon={<Boxes className="h-5 w-5" />} iconClass="bg-blue-50 text-blue-600" />
            <SummaryCard label="Pending" value={summary.pending} icon={<Truck className="h-5 w-5" />} iconClass="bg-amber-50 text-amber-600" />
            <SummaryCard label="In Transit" value={summary.inTransit} icon={<Truck className="h-5 w-5" />} iconClass="bg-sky-50 text-sky-600" />
            <SummaryCard label="Completed" value={summary.completed} icon={<PackageCheck className="h-5 w-5" />} iconClass="bg-emerald-50 text-emerald-600" />
          </section>

          <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-xl">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by distribution ID, request ID, org ID or receiver..."
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status} className="text-gray-900 bg-white">
                      {status === 'All' ? 'All Statuses' : status}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={fetchDistributions}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <LoadingState />
            ) : distributions.length === 0 ? (
              <EmptyState
                title="No distributions yet"
                description="Create the first distribution from the button above."
                onAdd={() => {
                  setEditingDistribution(null);
                  setFormOpen(true);
                }}
              />
            ) : filteredDistributions.length === 0 ? (
              <EmptyState title="No matching distributions" description="Try changing the filters or search query." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-slate-100 text-[11px] font-bold uppercase tracking-wide text-gray-700">
                      <th className="px-5 py-4">Distribution ID</th>
                      <th className="px-5 py-4">Request ID</th>
                      <th className="px-5 py-4">Distributor Org</th>
                      <th className="px-5 py-4">Receiver</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDistributions.map((item) => (
                      <tr key={item.distribution_id} className="text-sm transition hover:bg-emerald-50/20">
                        <td className="whitespace-nowrap px-5 py-4 font-bold text-emerald-700">#{item.distribution_id}</td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">#{item.request_id}</td>
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-800">
                          {item.distributed_by_organization_name || item.distributed_by_organization_id}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-800">
                          {item.received_by || '—'}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusBadgeClasses(item.distribution_status)}`}>
                            {item.distribution_status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-gray-700">
                          {formatDate(item.distribution_date)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              href={`/distributions/${item.distribution_id}`}
                              className="inline-flex items-center gap-1 rounded-lg p-2 text-sky-700 transition hover:bg-sky-50"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDistribution(item);
                                setFormOpen(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50"
                              title="Edit distribution"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="inline-flex items-center gap-1 rounded-lg p-2 text-rose-700 transition hover:bg-rose-50"
                              title="Delete distribution"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {formOpen && (
        <DistributionFormModal
          initialData={editingDistribution}
          onClose={() => setFormOpen(false)}
          onSuccess={async () => {
            setFormOpen(false);
            await fetchDistributions();
            showToast({
              type: 'success',
              message: editingDistribution
                ? 'Distribution updated successfully.'
                : 'Distribution created successfully.',
            });
          }}
          onError={(message) => showToast({ type: 'error', message })}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Distribution</h3>
            <p className="mt-2 text-sm font-medium text-gray-700">
              Are you sure you want to delete distribution #{deleteTarget.distribution_id}? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-5 right-5 z-[70] flex max-w-sm items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-xl ${toast.type === 'success' ? 'border-emerald-200' : 'border-rose-200'}`}>
          {toast.type === 'success' ? (
            <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          )}
          <p className="text-sm font-bold text-gray-900">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8 text-center text-gray-500">
      <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      Loading distributions...
    </div>
  );
}

function EmptyState({
  title,
  description,
  onAdd,
}: {
  title: string;
  description: string;
  onAdd?: () => void;
}) {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Truck className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      {onAdd && (
        <button
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add Distribution
        </button>
      )}
    </div>
  );
}

function DistributionFormModal({
  initialData,
  onClose,
  onSuccess,
  onError,
}: {
  initialData: Distribution | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const [formData, setFormData] = useState({
    request_id: initialData?.request_id?.toString() ?? '',
    distributed_by_organization_id: initialData?.distributed_by_organization_id?.toString() ?? '',
    distribution_status: initialData?.distribution_status ?? 'Pending',
    received_by: initialData?.received_by ?? '',
    delivery_note: initialData?.delivery_note ?? '',
    distribution_date: initialData?.distribution_date ?? new Date().toISOString().slice(0, 16),
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const requestId = Number(formData.request_id);
      const organizationId = Number(formData.distributed_by_organization_id);

      if (!Number.isInteger(requestId) || requestId <= 0) {
        throw new Error('Request ID must be a valid positive integer.');
      }

      if (!Number.isInteger(organizationId) || organizationId <= 0) {
        throw new Error('Distributor organization ID must be a valid positive integer.');
      }

      const payload = {
        request_id: requestId,
        distributed_by_organization_id: organizationId,
        distribution_date: formData.distribution_date || new Date().toISOString(),
        distribution_status: formData.distribution_status,
        received_by: formData.received_by?.trim() || undefined,
        delivery_note: formData.delivery_note?.trim() || undefined,
      };

      if (initialData) {
        await distributionApi.update(initialData.distribution_id, payload);
      } else {
        await distributionApi.create(payload);
      }

      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to save distribution.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="text-lg font-bold text-gray-900">{initialData ? 'Edit Distribution' : 'Add New Distribution'}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-600 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-800">Request ID</label>
              <input
                type="number"
                min="1"
                value={formData.request_id}
                onChange={(event) => setFormData({ ...formData, request_id: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-800">Distributor Org ID</label>
              <input
                type="number"
                min="1"
                value={formData.distributed_by_organization_id}
                onChange={(event) => setFormData({ ...formData, distributed_by_organization_id: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. 2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-800">Status</label>
              <select
                value={formData.distribution_status}
                onChange={(event) => setFormData({ ...formData, distribution_status: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-800">Distribution Date</label>
              <input
                type="datetime-local"
                value={formData.distribution_date}
                onChange={(event) => setFormData({ ...formData, distribution_date: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-800">Received By</label>
            <input
              type="text"
              value={formData.received_by}
              onChange={(event) => setFormData({ ...formData, received_by: event.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Recipient or staff member"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-800">Delivery Note</label>
            <textarea
              value={formData.delivery_note}
              onChange={(event) => setFormData({ ...formData, delivery_note: event.target.value })}
              rows={4}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Optional route or delivery instructions"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : initialData ? 'Update Distribution' : 'Create Distribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
