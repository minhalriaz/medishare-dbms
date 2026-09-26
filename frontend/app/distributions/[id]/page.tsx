'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { distributionApi } from '@/services/distributionApi';
import { Distribution } from '@/types/distribution';
import { ArrowLeft, CalendarDays, Building2, ClipboardList, PackageCheck, UserRound } from 'lucide-react';

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function DistributionDetailsPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError('');

      try {
        const data = await distributionApi.getById(id);
        setDistribution(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load distribution details.',
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <Sidebar />

      <main className="min-h-screen px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link
              href="/distributions"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to distributions
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
              Loading distribution details...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              {error}
            </div>
          ) : distribution ? (
            <div className="space-y-6">
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                      Distribution
                    </p>
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">
                      #{distribution.distribution_id}
                    </h1>
                  </div>

                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                    distribution.distribution_status?.toLowerCase() === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                      : distribution.distribution_status?.toLowerCase() === 'in transit'
                        ? 'bg-sky-50 text-sky-700 ring-sky-100'
                        : distribution.distribution_status?.toLowerCase() === 'pending'
                          ? 'bg-amber-50 text-amber-700 ring-amber-100'
                          : 'bg-slate-100 text-slate-700 ring-slate-200'
                  }`}>
                    {distribution.distribution_status || 'Pending'}
                  </span>
                </div>
              </section>

              <section className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Request information</h2>
                  </div>

                  <dl className="space-y-4 text-sm text-gray-700">
                    <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                      <dt className="font-medium text-gray-500">Request ID</dt>
                      <dd className="font-semibold text-gray-900">#{distribution.request_id}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                      <dt className="font-medium text-gray-500">Request Status</dt>
                      <dd className="font-semibold text-gray-900">{distribution.request_status || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                      <dt className="font-medium text-gray-500">Priority</dt>
                      <dd className="font-semibold text-gray-900">{distribution.priority_level || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-gray-500">Reason</dt>
                      <dd className="max-w-xs text-right font-medium text-gray-900">{distribution.reason || '—'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Distribution details</h2>
                  </div>

                  <dl className="space-y-4 text-sm text-gray-700">
                    <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                      <dt className="font-medium text-gray-500">Distributor organization</dt>
                      <dd className="font-semibold text-gray-900">
                        {distribution.distributed_by_organization_name || distribution.distributed_by_organization_id}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                      <dt className="font-medium text-gray-500">Requested from</dt>
                      <dd className="font-semibold text-gray-900">
                        {distribution.requested_from_organization_name || '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                      <dt className="font-medium text-gray-500">Received by</dt>
                      <dd className="font-semibold text-gray-900">{distribution.received_by || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-gray-500">Distribution date</dt>
                      <dd className="font-semibold text-gray-900">{formatDate(distribution.distribution_date)}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <Link href="/distribution-items" className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Manage distribution items</Link>

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Delivery note</h2>
                </div>
                <p className="text-sm leading-7 text-gray-700">
                  {distribution.delivery_note || 'No delivery note provided for this distribution.'}
                </p>
              </section>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
