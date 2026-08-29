'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import DonationDetailsPanel from '@/components/DonationDetailsPanel';
import { api } from '@/services/api';// BACKEND API CONNECTION
import { Donation } from '@/types/donation';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Gift,
  Package,
  AlertCircle,
  Clock,
} from 'lucide-react';

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDonations();// 🔴 CALLS BACKEND - GET
      setDonations(data);
    } catch (err) {
      setError('Could not load donations. Make sure the backend is running on the configured API port.');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this donation?')) {
      try {
        await api.deleteDonation(id);// 🔴 CALLS BACKEND - DELETE
        setDonations((prev) => prev.filter((d) => d.donation_id !== id));
        if (selectedDonation?.donation_id === id) setSelectedDonation(null);
      } catch (err) {
        alert('Failed to delete donation. Please try again.');
      }
    }
  };

  const filteredDonations = donations.filter((item) => {
    const matchesSearch =
      String(item.donor_user_id).includes(searchQuery) ||
      String(item.receiving_organization_id).includes(searchQuery) ||
      String(item.donation_id).includes(searchQuery);
    const matchesStatus =
      statusFilter === 'All' || item.donation_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Derived stats from real data
  const totalItems = donations.reduce(
    (acc, d) => acc + (d.donation_items?.length ?? 0),
    0,
  );
  const pendingCount = donations.filter(
    (d) => d.donation_status === 'Pending',
  ).length;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Donations</h1>
            <p className="text-xs text-gray-400">Dashboard &gt; Donations</p>
          </div>
          <Link
            href="/donations/create"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition text-sm"
          >
            <Plus className="w-4 h-4" />
            New Donation
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Donations</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{donations.length}</h3>
              <span className="text-[11px] text-gray-400 font-medium">From database</span>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Items</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalItems}</h3>
              <span className="text-[11px] text-gray-400 font-medium">Medicine units</span>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium">Completed</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {donations.filter((d) => d.donation_status === 'Completed').length}
              </h3>
              <span className="text-[11px] text-emerald-500 font-medium">Fulfilled</span>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium">Pending</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{pendingCount}</h3>
              <span className="text-[11px] text-amber-500 font-medium">Awaiting action</span>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-6 flex gap-4 items-center justify-between shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by donation ID, donor ID or org ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-700">Backend Unavailable</p>
              <p className="text-xs text-rose-500 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading donations from backend...
            </div>
          ) : filteredDonations.length === 0 && !error ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No donations found.{' '}
              <Link href="/donations/create" className="text-blue-600 hover:underline">
                Create the first one.
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] text-gray-400 uppercase font-semibold">
                  <th className="p-4">#</th>
                  <th className="p-4">Donation ID</th>
                  <th className="p-4">Donor ID</th>
                  <th className="p-4">Org ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Items</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredDonations.map((item, index) => (
                  <tr key={item.donation_id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 text-gray-400 text-xs">{index + 1}</td>
                    <td className="p-4 font-bold text-blue-600">DON-{String(item.donation_id).padStart(6, '0')}</td>
                    <td className="p-4 font-medium text-gray-800">User #{item.donor_user_id}</td>
                    <td className="p-4 text-gray-600">Org #{item.receiving_organization_id}</td>
                    <td className="p-4 text-gray-500 text-xs">
                      {item.donation_date
                        ? new Date(item.donation_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          item.donation_status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600'
                            : item.donation_status === 'Pending'
                            ? 'bg-amber-50 text-amber-600'
                            : item.donation_status === 'Received'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {item.donation_status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {item.donation_items?.length ?? 0}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedDonation(item)}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/donations/${item.donation_id}`}
                        className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg inline-block transition"
                        title="Edit donation"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.donation_id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                        title="Delete donation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <DonationDetailsPanel
        donation={selectedDonation}
        onClose={() => setSelectedDonation(null)}
      />
    </div>
  );
}