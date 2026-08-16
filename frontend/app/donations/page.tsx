'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import DonationDetailsPanel from '@/components/DonationDetailsPanel';
import { api } from '@/services/api';
import { Donation } from '@/types/donation';
import { 
  Search, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  Gift, 
  Package, 
  DollarSign, 
  Clock 
} from 'lucide-react';

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchDonations = async () => {
    setLoading(true);
    const data = await api.getDonations();
    setDonations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this donation?')) {
      await api.deleteDonation(id);
      setDonations(donations.filter((d) => d.id !== id));
      if (selectedDonation?.id === id) setSelectedDonation(null);
    }
  };

  const filteredDonations = donations.filter((item) => {
    const matchesSearch = 
      item.donor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.receivingOrganization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.donationId && item.donationId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              <h3 className="text-2xl font-bold text-gray-800 mt-1">128</h3>
              <span className="text-[11px] text-emerald-500 font-medium">↑ 18% from last month</span>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Items</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">342</h3>
              <span className="text-[11px] text-emerald-500 font-medium">↑ 23% from last month</span>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Value</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">$24,580</h3>
              <span className="text-[11px] text-emerald-500 font-medium">↑ 15% from last month</span>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium">Pending Donations</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">12</h3>
              <span className="text-[11px] text-rose-500 font-medium">↓ 4% from last month</span>
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
              placeholder="Search by donor or organization..."
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

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] text-gray-400 uppercase font-semibold">
                  <th className="p-4">#</th>
                  <th className="p-4">Donation ID</th>
                  <th className="p-4">Donor</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Items</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredDonations.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 text-gray-400 text-xs">{index + 1}</td>
                    <td className="p-4 font-bold text-blue-600">{item.donationId || item.id}</td>
                    <td className="p-4 font-medium text-gray-800">{item.donor}</td>
                    <td className="p-4 text-gray-600">{item.receivingOrganization}</td>
                    <td className="p-4 text-gray-500 text-xs">{item.donationDate}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                        item.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                        item.status === 'Received' ? 'bg-blue-50 text-blue-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{item.medicineItems?.reduce((acc, curr) => acc + curr.quantity, 0) || item.medicineItems?.length || 0}</td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedDonation(item)}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/donations/${item.id}`}
                        className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg inline-block transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
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