'use client';

import Sidebar from '@/components/Sidebar';
import { Building2, Search, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { organizationApi } from '../../services/organizationApi';

import {
  OrganizationDirectoryItem,
  OrganizationStatistics,
} from '../../types/organization';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<
    OrganizationDirectoryItem[]
  >([]);

  const [statistics, setStatistics] = useState<
    OrganizationStatistics[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // =====================================================
  // INITIAL DATA LOAD
  // =====================================================

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const [directoryData, statisticsData] = await Promise.all([
          organizationApi.getDirectory(),
          organizationApi.getStatistics(),
        ]);

        setOrganizations(directoryData);
        setStatistics(statisticsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load organization data',
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // =====================================================
  // SEARCH ORGANIZATIONS
  // Search is handled by RAW SQL in backend
  // WHERE + LIKE + parameterized query
  // =====================================================

  async function handleSearch() {
    try {
      setSearching(true);
      setError('');

      const trimmedQuery = searchQuery.trim();

      // If search box is empty, load all organizations again
      if (!trimmedQuery) {
        const data = await organizationApi.getDirectory();
        setOrganizations(data);
        return;
      }

      const data = await organizationApi.searchOrganizations(
        trimmedQuery,
      );

      setOrganizations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to search organizations',
      );
    } finally {
      setSearching(false);
    }
  }

  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  async function handleClearSearch() {
    try {
      setSearching(true);
      setError('');
      setSearchQuery('');

      const data = await organizationApi.getDirectory();

      setOrganizations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to reload organizations',
      );
    } finally {
      setSearching(false);
    }
  }

  async function handleDelete(
    organizationId: number,
    organizationName: string,
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${organizationName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(organizationId);
      setError('');

      await organizationApi.deleteOrganization(organizationId);

      const [directoryData, statisticsData] = await Promise.all([
        organizationApi.getDirectory(),
        organizationApi.getStatistics(),
      ]);

      setOrganizations(directoryData);
      setStatistics(statisticsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete organization',
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf9]">
        <Sidebar />

        <main className="min-h-screen px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1500px]">
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />

                <p className="mt-4 text-sm font-medium text-gray-500">
                  Loading organization data...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <Sidebar />

      <main className="min-h-screen px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1500px]">
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <header className="mb-7">
            <p className="text-xs font-medium text-gray-400">
              Dashboard / Organizations
            </p>

            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Organization Dashboard
                  </h1>

                  <Link
                    href="/organizations/new"
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    + Add Organization
                  </Link>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Manage organizations and monitor medicine
                  inventory statistics.
                </p>
              </div>
            </div>
          </header>

          {/* ================================================= */}
          {/* ERROR MESSAGE */}
          {/* ================================================= */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ================================================= */}
          {/* ORGANIZATION STATISTICS */}
          {/* Backend SQL:
              LEFT OUTER JOIN
              COUNT
              SUM
              AVG
              COALESCE
              GROUP BY
          */}
          {/* ================================================= */}

          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Organization Statistics
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Inventory summary calculated directly using raw SQL
                aggregate functions.
              </p>
            </div>

            {statistics.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-gray-500">
                  No organization statistics available.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {statistics.map((item) => (
                  <div
                    key={item.organization_id}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {item.organization_name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.organization_type}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.verification_status === 'Verified'
                            ? 'bg-emerald-50 text-emerald-600'
                            : item.verification_status === 'Pending'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {item.verification_status}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2 text-sm">
                        <span className="text-gray-500">
                          Inventory Records
                        </span>

                        <span className="font-semibold text-gray-800">
                          {item.total_inventory_records}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-gray-50 pb-2 text-sm">
                        <span className="text-gray-500">
                          Total Received
                        </span>

                        <span className="font-semibold text-gray-800">
                          {item.total_received_quantity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-gray-50 pb-2 text-sm">
                        <span className="text-gray-500">
                          Total Available
                        </span>

                        <span className="font-semibold text-emerald-600">
                          {item.total_available_quantity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Average Available
                        </span>

                        <span className="font-semibold text-gray-800">
                          {Number(
                            item.average_available_quantity,
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ================================================= */}
          {/* ORGANIZATION DIRECTORY */}
          {/* Backend SQL:
              INNER JOIN User + Organization
          */}
          {/* ================================================= */}

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Organization Directory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View and search registered organizations and their
                representatives.
              </p>
            </div>

            {/* ================================================= */}
            {/* SEARCH */}
            {/* Backend uses raw SQL:
                WHERE
                LIKE
                OR
                Parameterized Query
            */}
            {/* ================================================= */}

            <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative w-full md:max-w-2xl">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    placeholder="Search by organization, type, license, address or representative..."
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                      title="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Search className="h-4 w-4" />

                  {searching ? 'Searching...' : 'Search'}
                </button>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    disabled={searching}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Search is performed using raw SQL on the backend.
                </p>

                <p className="text-xs font-medium text-gray-500">
                  {organizations.length}{' '}
                  {organizations.length === 1
                    ? 'organization'
                    : 'organizations'}{' '}
                  found
                </p>
              </div>
            </div>

            {/* ================================================= */}
            {/* DIRECTORY TABLE */}
            {/* ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      <th className="px-5 py-4">
                        Organization
                      </th>

                      <th className="px-5 py-4">
                        Type
                      </th>

                      <th className="px-5 py-4">
                        License
                      </th>

                      <th className="px-5 py-4">
                        Representative
                      </th>

                      <th className="px-5 py-4">
                        Email
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      <th className="px-5 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {organizations.length > 0 ? (
                      organizations.map((organization) => (
                        <tr
                          key={organization.organization_id}
                          className="border-t border-gray-100 transition hover:bg-emerald-50/30"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {organization.organization_name}
                              </p>

                              {organization.organization_address && (
                                <p className="mt-1 max-w-[240px] truncate text-xs text-gray-400">
                                  {
                                    organization.organization_address
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                              {organization.organization_type}
                            </span>
                          </td>

                          <td className="px-5 py-4 font-medium text-gray-600">
                            {organization.licence_number}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-700">
                              {organization.representative_name}
                            </p>

                            {organization.representative_phone && (
                              <p className="mt-1 text-xs text-gray-400">
                                {
                                  organization.representative_phone
                                }
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4 text-gray-500">
                            {
                              organization.representative_email
                            }
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                organization.verification_status ===
                                'Verified'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : organization.verification_status ===
                                      'Pending'
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {
                                organization.verification_status
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/organizations/${organization.organization_id}/edit`}
                                className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                              >
                                Edit
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    organization.organization_id,
                                    organization.organization_name,
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  organization.organization_id
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />

                                {deletingId ===
                                organization.organization_id
                                  ? 'Deleting...'
                                  : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-12 text-center"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>

                          <p className="mt-3 font-medium text-gray-700">
                            No organizations found
                          </p>

                          <p className="mt-1 text-sm text-gray-400">
                            Try searching with another name,
                            organization type, license, address or
                            representative.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}