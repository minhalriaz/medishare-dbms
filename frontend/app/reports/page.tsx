'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Database, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { getApiBaseUrl } from '@/lib/apiBase';

const API_URL = getApiBaseUrl();

type Row = Record<string, unknown>;
type ReportData = Record<string, Row[]>;
type ReportErrors = Record<string, string>;

type ReportDefinition = {
  key: string;
  title: string;
  endpoint: string;
  description: string;
};

const sections: { title: string; reports: ReportDefinition[] }[] = [
  {
    title: 'Donation Operations',
    reports: [
      { key: 'donationSummary', title: 'Donation Summary', endpoint: 'donation-summary', description: 'Quantity and item totals for each donation.' },
      { key: 'organizationActivity', title: 'Organization Activity', endpoint: 'organization-activity', description: 'Donation activity across receiving organizations.' },
      { key: 'donationsNeedingAttention', title: 'Donations Needing Attention', endpoint: 'donations-needing-attention', description: 'Donations that do not have medicine items yet.' },
    ],
  },
  {
    title: 'Medicine Supply',
    reports: [
      { key: 'medicineContribution', title: 'Medicine Contribution', endpoint: 'medicine-contribution', description: 'Medicines ranked by donated quantity, including unused medicines.' },
      { key: 'highVolumeDonations', title: 'High-Volume Donations', endpoint: 'high-volume-donations', description: 'Donations containing more than five medicine units.' },
    ],
  },
  {
    title: 'Donation Insights',
    reports: [{ key: 'donationInsights', title: 'Donation Insights', endpoint: 'donation-insights', description: 'Donations above the average total quantity and item benchmarks.' }],
  },
];

async function loadReport(report: ReportDefinition): Promise<[string, Row[]]> {
  const response = await fetch(`${API_URL}/reports/${report.endpoint}`);
  if (!response.ok) throw new Error(`${report.title} returned ${response.status}`);
  const result = await response.json();
  if (report.key === 'donationInsights') {
    const stats = result.quantityStats?.[0] ?? {};
    const benchmarkRows = [
      { insight: 'Average item quantity', value: stats.average_quantity },
    ].filter((row) => row.value !== null && row.value !== undefined);
    const donationRows = (result.aboveAverageDonations ?? []).map((row: Row) => ({
      insight: 'Above-average donation total',
      donation_id: row.donation_id,
      value: row.total_quantity,
    }));
    return [report.key, [...benchmarkRows, ...donationRows]];
  }
  return [report.key, Array.isArray(result) ? result : []];
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string' && value.includes('T')) return value.slice(0, 10);
  return String(value);
}

function ReportTable({ rows }: { rows: Row[] }) {
  const columns = rows.length ? Object.keys(rows[0]) : [];
  if (!rows.length) return <p className="px-5 py-6 text-sm text-gray-400">No rows returned.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>{columns.map((column) => <th className="whitespace-nowrap px-5 py-3 font-semibold" key={column}>{column.replaceAll('_', ' ')}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, index) => <tr className="hover:bg-emerald-50/30" key={index}>{columns.map((column) => <td className="whitespace-nowrap px-5 py-3 text-gray-700" key={column}>{formatValue(row[column])}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData>({});
  const [reportErrors, setReportErrors] = useState<ReportErrors>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchReports() {
    setLoading(true);
    setError('');
    try {
      const reports = sections.flatMap((section) => section.reports);
      const results = await Promise.allSettled(reports.map(loadReport));
      const successful: [string, Row[]][] = [];
      const failed: ReportErrors = {};
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') successful.push(result.value);
        else failed[reports[index].key] = result.reason instanceof Error ? result.reason.message : 'Unable to load this report.';
      });
      setData(Object.fromEntries(successful));
      setReportErrors(failed);
      if (Object.keys(failed).length === reports.length) setError('Unable to load reports. Make sure SQL Server and the backend are running.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load reports.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReports(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <Sidebar />
      <main className="p-5 sm:p-8 lg:p-10">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">Live results from the MediShare donation and medicine tables.</p>
          </div>
          <button onClick={fetchReports} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </header>

        {error && <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error} Make sure SQL Server and the backend are running.</div>}
        {loading && <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Loading checkpoint results...</div>}

        {!loading && <div className="space-y-8">
          {sections.map((section) => <section key={section.title}>
            <div className="mb-4 flex items-center gap-3"><div className="rounded-lg bg-emerald-100 p-2 text-emerald-700"><BarChart3 className="h-5 w-5" /></div><h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">{section.title}</h2></div>
            <div className="space-y-5">
              {section.reports.map((report) => <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm" key={report.key}>
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5"><div><h3 className="font-bold text-gray-900">{report.title}</h3><p className="mt-1 text-xs text-gray-500">{report.description}</p></div><Database className="h-5 w-5 shrink-0 text-emerald-500" /></div>
                {reportErrors[report.key] ? <p className="px-5 py-6 text-sm text-rose-600">{reportErrors[report.key]}</p> : <ReportTable rows={data[report.key] ?? []} />}
              </article>)}
            </div>
          </section>)}
        </div>}
      </main>
    </div>
  );
}
