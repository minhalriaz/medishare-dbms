'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  DatabaseZap,
  Eye,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import VerificationFormModal from '@/components/VerificationFormModal';

import {
  verificationApi,
} from '@/services/verificationApi';

import {
  Verification,
  VerificationDetail,
  VerificationPayload,
} from '@/types/verification';

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

function resultBadgeClasses(result: string) {
  switch (result.toLowerCase()) {
    case 'approved':
    case 'verified':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-100';

    case 'rejected':
    case 'failed':
      return 'bg-rose-50 text-rose-700 ring-rose-100';

    case 'pending':
      return 'bg-amber-50 text-amber-700 ring-amber-100';

    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200';
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

export default function VerificationPage() {
  const [verifications, setVerifications] =
    useState<Verification[]>([]);

  const [verificationDetails, setVerificationDetails] =
    useState<VerificationDetail[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [resultFilter, setResultFilter] =
    useState('All');

  const [formMode, setFormMode] =
    useState<'create' | 'edit'>('create');

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingVerification, setEditingVerification] =
    useState<Verification | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [selectedVerification, setSelectedVerification] =
    useState<VerificationDetail | null>(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Verification | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [toast, setToast] =
    useState<ToastState>(null);

  const showToast = useCallback(
    (nextToast: ToastState) => {
      setToast(nextToast);

      window.setTimeout(() => {
        setToast(null);
      }, 3500);
    },
    [],
  );

  // ==========================================
  // LOAD DATA
  // ==========================================

  const fetchVerification = useCallback(
    async () => {
      setLoading(true);
      setError('');

      try {
        const data =
          await verificationApi.getAll();

        setVerifications(
          Array.isArray(data)
            ? data
            : [],
        );

        const details =
          await verificationApi.getDetails();

        setVerificationDetails(
          Array.isArray(details)
            ? details
            : [],
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load verification records.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void fetchVerification();
      }, 0);

    return () =>
      window.clearTimeout(timeoutId);
  }, [fetchVerification]);

  // ==========================================
  // SUMMARY
  // ==========================================

  const summary = useMemo(() => {
    return verifications.reduce(
      (totals, item) => {
        totals.records += 1;

        const result =
          item.verification_result
            .toLowerCase();

        if (
          result === 'approved' ||
          result === 'verified'
        ) {
          totals.approved += 1;
        }

        if (
          result === 'rejected' ||
          result === 'failed'
        ) {
          totals.rejected += 1;
        }

        if (result === 'pending') {
          totals.pending += 1;
        }

        return totals;
      },
      {
        records: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
      },
    );
  }, [verifications]);

  // ==========================================
  // RESULT OPTIONS
  // ==========================================

  const resultOptions = useMemo(() => {
    const values = verifications
      .map(
        (item) =>
          item.verification_result,
      )
      .filter(Boolean);

    return [
      'All',
      ...Array.from(
        new Set(values),
      ),
    ];
  }, [verifications]);

  // ==========================================
  // SEARCH + FILTER
  // ==========================================

  const filteredVerification =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return verifications.filter(
        (item) => {
          const matchesSearch =
            !query ||
            String(
              item.verification_id,
            ).includes(query) ||
            String(
              item.donation_item_id,
            ).includes(query) ||
            String(
              item.verified_by_user_id,
            ).includes(query) ||
            item.verification_result
              .toLowerCase()
              .includes(query) ||
            (
              item.verification_remarks ||
              ''
            )
              .toLowerCase()
              .includes(query);

          const matchesResult =
            resultFilter === 'All' ||
            item.verification_result ===
              resultFilter;

          return (
            matchesSearch &&
            matchesResult
          );
        },
      );
    }, [
      verifications,
      searchQuery,
      resultFilter,
    ]);

  // ==========================================
  // CREATE
  // ==========================================

  const handleCreate = () => {
    setFormMode('create');
    setEditingVerification(null);
    setFormOpen(true);
  };

  // ==========================================
  // VIEW DETAILS
  // ==========================================

  const handleView = async (
    verification: Verification,
  ) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setSelectedVerification(null);

    try {
      const details =
        await verificationApi.getDetails();

      const selected =
        details.find(
          (item) =>
            item.verification_id ===
            verification.verification_id,
        );

      if (!selected) {
        throw new Error(
          'Verification details not found.',
        );
      }

      setSelectedVerification(
        selected,
      );
    } catch (requestError) {
      showToast({
        type: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load verification details.',
      });

      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = async (
    verification: Verification,
  ) => {
    try {
      const freshVerification =
        await verificationApi.getById(
          verification.verification_id,
        );

      setEditingVerification(
        freshVerification,
      );

      setFormMode('edit');
      setFormOpen(true);
    } catch (requestError) {
      showToast({
        type: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load verification record.',
      });
    }
  };

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (
    payload: VerificationPayload,
  ) => {
    setSubmitting(true);

    try {
      if (formMode === 'create') {
        await verificationApi.create(
          payload,
        );

        showToast({
          type: 'success',
          message:
            'Verification record added successfully.',
        });
      } else if (
        editingVerification
      ) {
        await verificationApi.update(
          editingVerification.verification_id,
          payload,
        );

        showToast({
          type: 'success',
          message:
            'Verification record updated successfully.',
        });
      }

      setFormOpen(false);
      setEditingVerification(null);

      await fetchVerification();
    } catch (requestError) {
      showToast({
        type: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to save verification record.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    try {
      await verificationApi.remove(
        deleteTarget.verification_id,
      );

      showToast({
        type: 'success',
        message:
          'Verification record deleted successfully.',
      });

      setDeleteTarget(null);

      await fetchVerification();
    } catch (requestError) {
      showToast({
        type: 'error',
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Unable to delete verification record.',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7f5] text-slate-800">

      <Sidebar />

      <main className="min-h-screen px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">

        <div className="mx-auto max-w-[1500px]">

          {/* MOBILE HEADER */}

          <div className="mb-6 flex items-center gap-3 lg:hidden">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Menu className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                MediShare
              </p>

              <p className="text-sm font-bold text-gray-900">
                Verification
              </p>
            </div>

          </div>

          {/* HEADER */}

          <header className="relative mb-7 overflow-hidden rounded-[2rem] bg-[#123b35] px-6 py-7 text-white shadow-xl shadow-emerald-950/10 sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[34px] border-emerald-300/10" />
            <div className="pointer-events-none absolute bottom-[-92px] right-28 h-48 w-48 rounded-full border-[18px] border-teal-200/10" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  Trust & safety / Verification
                </div>

                <h1 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
                  Medicine verification, with confidence.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/75">
                  Review donated medicine, capture a clear audit trail, and keep every handoff accountable.
                </p>
              </div>

              <button
                onClick={handleCreate}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#d8f36a] px-5 py-3 text-sm font-bold text-[#163b32] shadow-lg shadow-black/10 transition hover:bg-[#e5fb88]"
              >
                <Plus className="h-4 w-4" />
                Add verification
              </button>
            </div>

            <div className="relative mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-xs text-emerald-50/65">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#d8f36a]" /> Verified records stay traceable</span>
              <span className="inline-flex items-center gap-2"><DatabaseZap className="h-4 w-4 text-emerald-200" /> Live API data</span>
            </div>
          </header>

          {/* SUMMARY */}

          <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              label="Total Verifications"
              value={summary.records}
              icon={
                <ShieldCheck className="h-5 w-5" />
              }
              iconClass="bg-sky-50 text-sky-600"
            />

            <SummaryCard
              label="Approved / Verified"
              value={summary.approved}
              icon={
                <ShieldCheck className="h-5 w-5" />
              }
              iconClass="bg-[#e8f7d0] text-[#4c7914]"
            />

            <SummaryCard
              label="Rejected / Failed"
              value={summary.rejected}
              icon={
                <AlertCircle className="h-5 w-5" />
              }
              iconClass="bg-rose-50 text-rose-600"
            />

            <SummaryCard
              label="Pending"
              value={summary.pending}
              icon={
                <RefreshCw className="h-5 w-5" />
              }
              iconClass="bg-amber-50 text-amber-600"
            />

          </section>

          {/* SEARCH / FILTER */}

          <section className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(20,61,52,0.06)]">

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div className="relative w-full md:max-w-xl">

                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value,
                    )
                  }
                  placeholder="Search verification ID, donation item, user, result..."
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fbf9] py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <select
                  value={resultFilter}
                  onChange={(event) =>
                    setResultFilter(
                      event.target.value,
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  {resultOptions.map(
                    (result) => (
                      <option
                        key={result}
                        value={result}
                      >
                        {result === 'All'
                          ? 'All Results'
                          : result}
                      </option>
                    ),
                  )}

                </select>

                <button
                  type="button"
                  onClick={fetchVerification}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <RefreshCw
                    className={`h-4 w-4 ${
                      loading
                        ? 'animate-spin'
                        : ''
                    }`}
                  />

                  Refresh

                </button>

              </div>

            </div>

          </section>

          {/* MAIN TABLE */}

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(20,61,52,0.06)]">

            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState
                message={error}
                onRetry={fetchVerification}
              />
            ) : verifications.length === 0 ? (
              <EmptyState
                title="No verification records yet"
                description="Add a verification record to start verifying donated medicine."
                onAdd={handleCreate}
              />
            ) : filteredVerification.length === 0 ? (
              <EmptyState
                title="No matching verification records"
                description="Try changing your search text or result filter."
              />
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px] border-collapse text-left">

                  <thead>

                    <tr className="border-b border-slate-200 bg-[#f7faf8] text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">

                      <th className="px-5 py-4">
                        Verification ID
                      </th>

                      <th className="px-5 py-4">
                        Donation Item
                      </th>

                      <th className="px-5 py-4">
                        Verified By
                      </th>

                      <th className="px-5 py-4">
                        Result
                      </th>

                      <th className="px-5 py-4">
                        Remarks
                      </th>

                      <th className="px-5 py-4">
                        Date
                      </th>

                      <th className="px-5 py-4 text-right">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredVerification.map(
                      (item) => (
                        <tr
                          key={
                            item.verification_id
                          }
                          className="text-sm text-slate-700 transition hover:bg-[#f5fae9]"
                        >

                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700">{item.verification_id}</span>
                              <span className="font-semibold text-slate-800">Verification</span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-medium">
                            #{item.donation_item_id}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            User #{item.verified_by_user_id}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${resultBadgeClasses(
                                item.verification_result,
                              )}`}
                            >
                              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                              {item.verification_result}
                            </span>

                          </td>

                          <td
                            className="max-w-[280px] truncate px-5 py-4 text-slate-600"
                            title={
                              item.verification_remarks ||
                              ''
                            }
                          >
                            {item.verification_remarks ||
                              'No remarks'}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                            {formatDate(
                              item.verification_date,
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right">

                            <div className="inline-flex items-center gap-1">

                              <ActionButton
                                label="View"
                                onClick={() =>
                                  void handleView(
                                    item,
                                  )
                                }
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4" />
                              </ActionButton>

                              <ActionButton
                                label="Edit"
                                onClick={() =>
                                  void handleEdit(
                                    item,
                                  )
                                }
                                className="text-emerald-600 hover:bg-emerald-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </ActionButton>

                              <ActionButton
                                label="Delete"
                                onClick={() =>
                                  setDeleteTarget(
                                    item,
                                  )
                                }
                                className="text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </ActionButton>

                            </div>

                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </section>

          {/* ==========================================
              VIEW DETAILS
          ========================================== */}

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(20,61,52,0.06)]">

            <div className="flex flex-col gap-2 border-b border-slate-200 bg-[#f7faf8] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Verification details</h2>
                <p className="mt-1 text-sm text-slate-600">Related medicine, donation, organization, and verifier information.</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                <DatabaseZap className="h-3.5 w-3.5 text-emerald-600" />
                Linked records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-5 py-4">Verification</th>
                    <th className="px-5 py-4">Medicine</th>
                    <th className="px-5 py-4">Batch</th>
                    <th className="px-5 py-4">Organization</th>
                    <th className="px-5 py-4">Verified By</th>
                    <th className="px-5 py-4">Result</th>
                    <th className="px-5 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {verificationDetails.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                        No verification detail data available.
                      </td>
                    </tr>
                  ) : (
                    verificationDetails.map((item) => (
                      <tr key={item.verification_id} className="text-sm text-slate-700 transition hover:bg-[#f5fae9]">
                        <td className="px-5 py-4 font-semibold text-emerald-700">#{item.verification_id}</td>
                        <td className="px-5 py-4">{item.medicine_name}</td>
                        <td className="px-5 py-4">{item.batch_number}</td>
                        <td className="px-5 py-4">{item.organization_name}</td>
                        <td className="px-5 py-4">{item.verified_by}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${resultBadgeClasses(item.verification_result)}`}>
                            {item.verification_result}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">{formatDate(item.verification_date)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ==========================================
              STORED PROCEDURE SECTION
          ========================================== */}

          <ProcedureSection
            onShowResult={async (
              result,
            ) => {
              try {
                const data =
                  await verificationApi.getByResult(
                    result,
                  );

                if (!Array.isArray(data)) {
                  showToast({
                    type: 'error',
                    message:
                      'No procedure results were returned.',
                  });
                }

                setVerificationDetails(
                  Array.isArray(data)
                    ? data
                    : [],
                );
              } catch (requestError) {
                showToast({
                  type: 'error',
                  message:
                    requestError instanceof Error
                      ? requestError.message
                      : 'Unable to run verification procedure.',
                });
              }
            }}
            onReset={fetchVerification}
          />

          {/* FOOTER */}

          {!loading &&
            !error &&
            verifications.length > 0 && (
              <div className="mt-3 flex flex-col gap-1 px-1 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">

                <span>
                  Showing{' '}
                  {filteredVerification.length}{' '}
                  of {verifications.length}{' '}
                  verification records
                </span>

                <span>
                  Data source: NestJS Verification API
                </span>

              </div>
            )}

        </div>
      </main>

      {/* FORM MODAL */}

      <VerificationFormModal
        open={formOpen}
        mode={formMode}
        verification={editingVerification}
        submitting={submitting}
        onClose={() => {
          if (submitting) return;

          setFormOpen(false);
          setEditingVerification(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* DETAILS PANEL */}

      {detailsOpen && (
        <VerificationDetailsPanel
          verification={
            selectedVerification
          }
          loading={detailsLoading}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedVerification(null);
          }}
        />
      )}

      {/* DELETE DIALOG */}

      {deleteTarget && (
        <DeleteVerificationDialog
          verification={deleteTarget}
          deleting={deleting}
          onCancel={() => {
            if (!deleting) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={handleDelete}
        />
      )}

      {/* TOAST */}

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[70] flex max-w-sm items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-xl ${
            toast.type === 'success'
              ? 'border-emerald-100'
              : 'border-rose-100'
          }`}
        >

          {toast.type === 'success' ? (
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          )}

          <p className="text-sm font-medium text-gray-800">
            {toast.message}
          </p>

        </div>
      )}

    </div>
  );
}

// SUMMARY CARD
// =====================================

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
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

      <div>

        <p className="text-xs font-medium text-gray-400">
          {label}
        </p>

        <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          {value.toLocaleString()}
        </p>

      </div>

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

    </div>
  );
}

// =====================================
// ACTION BUTTON
// =====================================

function ActionButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded-lg p-2 transition ${className}`}
    >
      {children}
    </button>
  );
}

// =====================================
// PROCEDURE SECTION
// =====================================

function ProcedureSection({
  onShowResult,
  onReset,
}: {
  onShowResult: (
    result: string,
  ) => Promise<void>;
  onReset: () => Promise<void>;
}) {
  const [result, setResult] =
    useState('');

  const [running, setRunning] =
    useState(false);

  const runProcedure = async () => {
    if (!result.trim()) return;

    setRunning(true);

    try {
      await onShowResult(
        result.trim(),
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="mb-4">

        <h2 className="text-lg font-bold text-gray-900">
          Verification Result Search
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Search verification records using the
          database stored procedure.
        </p>

      </div>

      <div className="flex flex-col gap-3 sm:flex-row">

        <input
          type="text"
          value={result}
          onChange={(event) =>
            setResult(
              event.target.value,
            )
          }
          placeholder="Enter result, e.g. Approved"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        <button
          type="button"
          onClick={() =>
            void runProcedure()
          }
          disabled={
            running ||
            !result.trim()
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >

          {running && (
            <RefreshCw className="h-4 w-4 animate-spin" />
          )}

          Run Search

        </button>

        <button
          type="button"
          onClick={() => {
            setResult('');
            void onReset();
          }}
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Reset
        </button>

      </div>

    </section>
  );
}

// =====================================
// DETAILS PANEL
// =====================================

function VerificationDetailsPanel({
  verification,
  loading,
  onClose,
}: {
  verification: VerificationDetail | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-slate-950/40 backdrop-blur-[2px]">

      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">

        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Verification
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900">
              Verification Details
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
          >
            Close
          </button>

        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16 text-sm text-gray-500">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
            Loading details...
          </div>
        ) : !verification ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Verification details could not be found.
          </div>
        ) : (
          <div className="space-y-5 p-6">

            <DetailCard title="Verification">

              <DetailRow
                label="Verification ID"
                value={`#${verification.verification_id}`}
              />

              <DetailRow
                label="Donation Item ID"
                value={String(
                  verification.donation_item_id,
                )}
              />

              <DetailRow
                label="Result"
                value={verification.verification_result}
              />

              <DetailRow
                label="Verification Date"
                value={new Date(
                  verification.verification_date,
                ).toLocaleString()}
              />

              <DetailRow
                label="Remarks"
                value={
                  verification.verification_remarks ||
                  'No remarks'
                }
              />

            </DetailCard>

            <DetailCard title="Medicine">

              <DetailRow
                label="Medicine"
                value={verification.medicine_name}
              />

              <DetailRow
                label="Medicine ID"
                value={String(
                  verification.medicine_id,
                )}
              />

              <DetailRow
                label="Batch Number"
                value={verification.batch_number}
              />

              <DetailRow
                label="Quantity"
                value={String(
                  verification.quantity,
                )}
              />

              <DetailRow
                label="Expiry Date"
                value={formatDate(
                  verification.expiry_date,
                )}
              />

            </DetailCard>

            <DetailCard title="Verifier">

              <DetailRow
                label="Name"
                value={verification.verified_by}
              />

              <DetailRow
                label="User ID"
                value={String(
                  verification.verified_by_user_id,
                )}
              />

              <DetailRow
                label="Email"
                value={verification.verifier_email}
              />

            </DetailCard>

            <DetailCard title="Donation & Organization">

              <DetailRow
                label="Donation ID"
                value={String(
                  verification.donation_id,
                )}
              />

              <DetailRow
                label="Organization"
                value={verification.organization_name}
              />

              <DetailRow
                label="Organization ID"
                value={String(
                  verification.receiving_organization_id,
                )}
              />

              <DetailRow
                label="Donation Date"
                value={formatDate(
                  verification.donation_date,
                )}
              />

            </DetailCard>

          </div>
        )}

      </div>

    </div>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <h3 className="mb-4 text-sm font-bold text-gray-900">
        {title}
      </h3>

      <div className="space-y-3">
        {children}
      </div>

    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-200 pb-3 last:border-0 last:pb-0">

      <span className="text-xs font-medium text-gray-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-gray-800">
        {value}
      </span>

    </div>
  );
}

// =====================================
// DELETE DIALOG
// =====================================

function DeleteVerificationDialog({
  verification,
  deleting,
  onCancel,
  onConfirm,
}: {
  verification: Verification;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">

      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">

          <Trash2 className="h-5 w-5" />

        </div>

        <h2 className="mt-4 text-lg font-bold text-gray-900">
          Delete Verification?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          This will permanently delete verification
          #{verification.verification_id}.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              void onConfirm()
            }
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
          >

            {deleting && (
              <RefreshCw className="h-4 w-4 animate-spin" />
            )}

            Delete

          </button>

        </div>

      </div>

    </div>
  );
}

// =====================================
// LOADING STATE
// =====================================

function LoadingState() {
  return (
    <div className="p-5">

      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500">

        <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />

        Loading verification records...

      </div>

      <div className="space-y-3">

        {[1, 2, 3, 4, 5].map(
          (row) => (
            <div
              key={row}
              className="h-14 animate-pulse rounded-xl bg-gray-100"
            />
          ),
        )}

      </div>

    </div>
  );
}

// =====================================
// ERROR STATE
// =====================================

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertCircle className="h-7 w-7" />
      </div>

      <h3 className="mt-4 text-base font-bold text-gray-900">
        Could not load verification
      </h3>

      <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
        {message}
      </p>

      <button
        type="button"
        onClick={() =>
          void onRetry()
        }
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
      >

        <RefreshCw className="h-4 w-4" />

        Try Again

      </button>

    </div>
  );
}

// =====================================
// EMPTY STATE
// =====================================

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
    <div className="flex flex-col items-center px-6 py-16 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">

        <ShieldCheck className="h-8 w-8" />

      </div>

      <h3 className="mt-4 text-base font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>

      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >

          <Plus className="h-4 w-4" />

          Add Verification

        </button>
      )}

    </div>
  );
}