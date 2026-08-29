'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Boxes,
  Eye,
  PackageCheck,
  PackageOpen,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { organizationApi } from '@/services/organizationApi';
import { medicineRequestApi } from '@/services/medicineRequestApi';
import { getUsers } from '@/services/userApi';
import { MedicineRequest } from '@/types/medicineRequest';

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

const statusOptions = ['All', 'Pending', 'Approved', 'Rejected'];

function statusBadgeClasses(status: string) {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    case 'pending':
      return 'bg-amber-50 text-amber-700 ring-amber-100';
    case 'rejected':
      return 'bg-rose-50 text-rose-700 ring-rose-100';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200';
  }
}

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

export default function MedicineRequestsPage() {
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formOpen, setFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MedicineRequest | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<MedicineRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((nextToast: ToastState) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await medicineRequestApi.getAll();
      setRequests(Array.isArray(data) ? data : []);
    } catch (requestError) {
      // API ফেইল করলে অ্যাপ ক্র্যাশ না করে ফাঁকা অ্যারে সেট করবে এবং টোস্ট দিয়ে জানাবে
      setRequests([]);
      showToast({
        type: 'error',
        message: requestError instanceof Error ? requestError.message : 'Failed to fetch medicine requests.',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const summary = useMemo(() => {
    return requests.reduce(
      (totals, item) => {
        totals.records += 1;
        totals.totalItems += Number(item.total_requested_items) || 0;

        const status = (item.request_status || '').toLowerCase();
        if (status === 'pending') {
          totals.pending += 1;
        } else if (status === 'approved') {
          totals.approved += 1;
        }

        return totals;
      },
      { records: 0, totalItems: 0, pending: 0, approved: 0 },
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return requests.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.request_id).includes(query) ||
        String(item.requester_name || '').toLowerCase().includes(query) ||
        String(item.requested_from_org || '').toLowerCase().includes(query) ||
        String(item.request_status || '').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'All' || item.request_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const handleCreate = () => {
    setFormMode('create');
    setEditingRequest(null);
    setFormOpen(true);
  };

  const handleEdit = (request: MedicineRequest) => {
    setEditingRequest(request);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await medicineRequestApi.remove(deleteTarget.request_id);
      showToast({ type: 'success', message: 'Medicine request deleted successfully.' });
      setDeleteTarget(null);
      await fetchRequests();
    } catch (requestError) {
      showToast({
        type: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to delete medicine request.',
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
              <p className="text-xs font-medium text-gray-500">Dashboard / Medicine Requests</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Medicine Requests
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Manage and track medicine requests made by users to organizations.
              </p>
            </div>

            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              New Request
            </button>
          </header>

          <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Requests" value={summary.records} icon={<Boxes className="h-5 w-5" />} iconClass="bg-blue-50 text-blue-600" />
            <SummaryCard label="Total Items Requested" value={summary.totalItems} icon={<PackageCheck className="h-5 w-5" />} iconClass="bg-emerald-50 text-emerald-600" />
            <SummaryCard label="Pending Requests" value={summary.pending} icon={<TriangleAlert className="h-5 w-5" />} iconClass="bg-amber-50 text-amber-600" />
            <SummaryCard label="Approved Requests" value={summary.approved} icon={<PackageOpen className="h-5 w-5" />} iconClass="bg-teal-50 text-teal-600" />
          </section>

          <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-xl">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search request ID, requester, organization, status..."
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
                  onClick={fetchRequests}
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
            ) : requests.length === 0 ? (
              <EmptyState title="No medicine requests yet" description="Add the first medicine request using the button above." onAdd={handleCreate} />
            ) : filteredRequests.length === 0 ? (
              <EmptyState title="No matching medicine requests" description="Try changing your search text or status filter." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-slate-100 text-[11px] font-bold uppercase tracking-wide text-gray-700">
                      <th className="px-5 py-4">Request ID</th>
                      <th className="px-5 py-4">Requester Name</th>
                      <th className="px-5 py-4">Requested From Org</th>
                      <th className="px-5 py-4">Priority</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Total Items</th>
                      <th className="px-5 py-4">Request Date</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRequests.map((item) => (
                      <tr key={item.request_id} className="text-sm transition hover:bg-emerald-50/20">
                        <td className="whitespace-nowrap px-5 py-4 font-bold text-emerald-700">#{item.request_id}</td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">{item.requester_name}</td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">{item.requested_from_org}</td>
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-800">{item.priority_level}</td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusBadgeClasses(item.request_status)}`}>
                            {item.request_status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-bold text-gray-900">{item.total_requested_items}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-gray-700">{formatDate(item.request_date)}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <ActionButton label="Edit" onClick={() => handleEdit(item)} className="text-emerald-700 hover:bg-emerald-50"><Pencil className="h-4 w-4" /></ActionButton>
                            <ActionButton label="Delete" onClick={() => setDeleteTarget(item)} className="text-rose-700 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></ActionButton>
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

      {/* Request Form Modal */}
      {formOpen && (
        <RequestFormModal
          mode={formMode}
          initialData={editingRequest}
          onClose={() => setFormOpen(false)}
          onSuccess={async () => {
            setFormOpen(false);
            await fetchRequests();
            showToast({ type: 'success', message: formMode === 'create' ? 'Request added successfully.' : 'Request updated successfully.' });
          }}
          onError={(msg) => showToast({ type: 'error', message: msg })}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Request</h3>
            <p className="mt-2 text-sm font-medium text-gray-700">Are you sure you want to delete request #{deleteTarget.request_id}? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[70] flex max-w-sm items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-xl ${toast.type === 'success' ? 'border-emerald-200' : 'border-rose-200'}`}>
          {toast.type === 'success' ? <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}
          <p className="text-sm font-bold text-gray-900">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

function RequestFormModal({
  mode,
  initialData,
  onClose,
  onSuccess,
  onError,
}: {
  mode: 'create' | 'edit';
  initialData: MedicineRequest | null;
  onClose: () => void;
  onSuccess: (createdRequest?: MedicineRequest) => void;
  onError: (msg: string) => void;
}) {
  const [formData, setFormData] = useState({
    requester_user_id: initialData?.requester_user_id?.toString() ?? '',
    requester_name: initialData?.requester_name ?? '',
    requested_from_organization_id: initialData?.requested_from_organization_id?.toString() ?? '',
    requested_from_org: initialData?.requested_from_org ?? '',
    priority_level: initialData?.priority_level ?? 'Normal',
    request_status: initialData?.request_status ?? 'Pending',
    reason: initialData?.reason ?? '',
    medicine_id: initialData?.request_items?.[0]?.medicine_id?.toString() ?? '1',
    total_requested_items: initialData?.total_requested_items?.toString() ?? initialData?.request_items?.[0]?.quantity?.toString() ?? '1',
    quantity: initialData?.request_items?.[0]?.quantity?.toString() ?? '1',
    notes: initialData?.request_items?.[0]?.notes ?? '',
  });
  const [submitting, setSubmitting] = useState(false);

  const resolveRequesterUserId = async () => {
    const requestedIdValue = formData.requester_user_id.trim();
    const requestedNameValue = formData.requester_name.trim();

    if (requestedIdValue) {
      const numericId = Number(requestedIdValue);
      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new Error('Requester ID must be a valid positive number.');
      }

      return numericId;
    }

    if (requestedNameValue) {
      const users = await getUsers();
      const normalized = requestedNameValue.trim().toLowerCase();
      const match = users.find(
        (user) =>
          user.full_name.trim().toLowerCase() === normalized ||
          user.full_name.trim().toLowerCase().includes(normalized),
      );

      if (!match) {
        throw new Error(`User "${requestedNameValue}" was not found. Add the user first or use the user ID.`);
      }

      return match.user_id;
    }

    throw new Error('Please enter a requester ID or requester name.');
  };

  const resolveRequestedOrganizationId = async () => {
    const requestedIdValue = formData.requested_from_organization_id.trim();
    const requestedNameValue = formData.requested_from_org.trim();

    if (requestedIdValue) {
      const numericId = Number(requestedIdValue);
      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new Error('Organization ID must be a valid positive number.');
      }

      return numericId;
    }

    if (requestedNameValue) {
      const organizations = await organizationApi.getDirectory();
      const normalized = requestedNameValue.trim().toLowerCase();
      const match = organizations.find(
        (organization) =>
          organization.organization_name.trim().toLowerCase() === normalized ||
          organization.organization_name.trim().toLowerCase().includes(normalized),
      );

      if (!match) {
        throw new Error(`Organization "${requestedNameValue}" was not found. Add the organization first or use the organization ID.`);
      }

      return match.organization_id;
    }

    throw new Error('Please enter an organization ID or organization name.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const requesterUserId = await resolveRequesterUserId();
      const requestedOrganizationId = await resolveRequestedOrganizationId();
      const medicineId = Number(formData.medicine_id);
      const totalItems = Number(formData.total_requested_items || formData.quantity || 1);

      if (!Number.isInteger(medicineId) || medicineId < 1) {
        throw new Error('Medicine ID must be a valid positive number.');
      }

      if (!Number.isInteger(totalItems) || totalItems < 1) {
        throw new Error('Total items must be a valid positive number.');
      }

      const payload = {
        requester_user_id: requesterUserId,
        requested_from_organization_id: requestedOrganizationId,
        priority_level: formData.priority_level,
        reason: formData.reason.trim(),
        request_status: formData.request_status,
        request_items: [
          {
            medicine_id: medicineId,
            quantity: totalItems,
            notes: formData.notes?.trim() || undefined,
          },
        ],
      };

      let createdRequest: MedicineRequest | undefined;

      if (mode === 'create') {
        createdRequest = await medicineRequestApi.create(payload);
      } else if (initialData) {
        createdRequest = await medicineRequestApi.update(initialData.request_id, payload);
      }

      onSuccess(createdRequest);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to save request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="text-lg font-bold text-gray-900">{mode === 'create' ? 'Add New Request' : 'Edit Request'}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-600 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-800">Requester ID</label>
              <input
                type="number"
                min="1"
                value={formData.requester_user_id}
                onChange={(e) => setFormData({ ...formData, requester_user_id: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-800">Requester Name</label>
              <input
                type="text"
                value={formData.requester_name}
                onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. Test User"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-800">Organization ID</label>
              <input
                type="number"
                min="1"
                value={formData.requested_from_organization_id}
                onChange={(e) => setFormData({ ...formData, requested_from_organization_id: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-800">Requested Organization</label>
              <input
                type="text"
                value={formData.requested_from_org}
                onChange={(e) => setFormData({ ...formData, requested_from_org: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. Test Org"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-800">Priority Level</label>
              <select
                value={formData.priority_level}
                onChange={(e) => setFormData({ ...formData, priority_level: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="Normal" className="text-gray-900 bg-white">Normal</option>
                <option value="High" className="text-gray-900 bg-white">High</option>
                <option value="Urgent" className="text-gray-900 bg-white">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-800">Status</label>
              <select
                value={formData.request_status}
                onChange={(e) => setFormData({ ...formData, request_status: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="Pending" className="text-gray-900 bg-white">Pending</option>
                <option value="Approved" className="text-gray-900 bg-white">Approved</option>
                <option value="Rejected" className="text-gray-900 bg-white">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-800">Request Reason</label>
            <textarea
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Explain why this medicine is needed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-800">Medicine ID</label>
              <input
                type="number"
                min="1"
                required
                value={formData.medicine_id}
                onChange={(e) => setFormData({ ...formData, medicine_id: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-800">Total Items</label>
              <input
                type="number"
                min="1"
                required
                value={formData.total_requested_items}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setFormData({ ...formData, total_requested_items: nextValue, quantity: nextValue });
                }}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-800">Item Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Optional notes"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {submitting ? 'Saving...' : mode === 'create' ? 'Add Request' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, iconClass }: { label: string; value: number; icon: React.ReactNode; iconClass: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold text-gray-600">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{value.toLocaleString()}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>{icon}</div>
    </div>
  );
}

function ActionButton({ label, onClick, className, children }: { label: string; onClick: () => void; className: string; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} title={label} aria-label={label} className={`rounded-lg p-2 transition ${className}`}>{children}</button>;
}

function LoadingState() {
  return (
    <div className="p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
        Loading medicine requests...
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((row) => <div key={row} className="h-14 animate-pulse rounded-xl bg-gray-100" />)}
      </div>
    </div>
  );
}

function EmptyState({ title, description, onAdd }: { title: string; description: string; onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600"><Boxes className="h-8 w-8" /></div>
      <h3 className="mt-4 text-base font-bold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm font-medium leading-6 text-gray-600">{description}</p>
      {onAdd && (
        <button type="button" onClick={onAdd} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> New Request
        </button>
      )}
    </div>
  );
}