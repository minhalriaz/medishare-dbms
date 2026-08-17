'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { api } from '@/services/api';
import { MedicineItem } from '@/types/donation';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

export default function CreateDonationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [donor, setDonor] = useState('');
  const [receivingOrganization, setReceivingOrganization] = useState('');
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);
  const [donorNote, setDonorNote] = useState('');
  const [status, setStatus] = useState<'Pending' | 'Completed' | 'Received' | 'Cancelled'>('Pending');

  const [medicineItems, setMedicineItems] = useState<MedicineItem[]>([
    {
      medicineName: '',
      batchNumber: '',
      quantity: 1,
      mfgDate: '',
      expDate: '',
      packagingCondition: 'Good',
    },
  ]);

  const handleAddItem = () => {
    setMedicineItems([
      ...medicineItems,
      {
        medicineName: '',
        batchNumber: '',
        quantity: 1,
        mfgDate: '',
        expDate: '',
        packagingCondition: 'Good',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (medicineItems.length > 1) {
      setMedicineItems(medicineItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof MedicineItem, value: any) => {
    const updated = [...medicineItems];
    updated[index] = { ...updated[index], [field]: value };
    setMedicineItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      donor,
      receivingOrganization,
      donationDate,
      donorNote,
      status,
      medicineItems,
      totalValue: medicineItems.length * 50,
    };

    await api.createDonation(payload);
    setLoading(false);
    router.push('/donations');
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="mb-6">
          <Link
            href="/donations"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Donations
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Create New Donation</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
          {/* Donation Info */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 mb-4">Donation Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Donor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Johnson"
                  value={donor}
                  onChange={(e) => setDonor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Receiving Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Hospital"
                  value={receivingOrganization}
                  onChange={(e) => setReceivingOrganization(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Donation Date</label>
                <input
                  type="date"
                  required
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Donor Note</label>
                <input
                  type="text"
                  placeholder="e.g. Keep in cool storage"
                  value={donorNote}
                  onChange={(e) => setDonorNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Medicine Items */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-gray-800">Medicine Items</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine Item
              </button>
            </div>

            <div className="space-y-4">
              {medicineItems.map((item, index) => (
                <div key={index} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-emerald-600">Item #{index + 1}</span>
                    {medicineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Medicine Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Paracetamol 500mg"
                        value={item.medicineName}
                        onChange={(e) => handleItemChange(index, 'medicineName', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Batch Number</label>
                      <input
                        type="text"
                        required
                        placeholder="BATCH-001"
                        value={item.batchNumber}
                        onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Manufacturing Date</label>
                      <input
                        type="date"
                        value={item.mfgDate}
                        onChange={(e) => handleItemChange(index, 'mfgDate', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={item.expDate}
                        onChange={(e) => handleItemChange(index, 'expDate', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">Packaging Condition</label>
                      <select
                        value={item.packagingCondition}
                        onChange={(e) => handleItemChange(index, 'packagingCondition', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Good">Good</option>
                        <option value="Damaged">Damaged</option>
                        <option value="Opened">Opened</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/donations')}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Donation'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}