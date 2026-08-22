'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { api } from '@/services/api'; //backend for update
import { DonationItem } from '@/types/donation';
import { ArrowLeft, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

type EditItem = Omit<DonationItem, 'donation_id'>;

const emptyItem = (): EditItem => ({
  medicine_id: 0,
  batch_number: '',
  quantity: 1,
  manufacturing_date: '',
  expiry_date: '',
  packaging_condition: 'Good',
  storage_condition: 'Room Temperature',
});

export default function EditDonationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [donor_user_id, setDonorUserId] = useState<number | ''>('');
  const [receiving_organization_id, setReceivingOrgId] = useState<number | ''>('');
  const [donation_date, setDonationDate] = useState('');
  const [donor_note, setDonorNote] = useState('');
  const [donation_status, setDonationStatus] = useState('Pending');
  const [medicineItems, setMedicineItems] = useState<EditItem[]>([emptyItem()]);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const data = await api.getDonationById(id);
        // 🔴 BACKEND API CALL:
        // Sends a GET request through the API service to retrieve
        // the donation with the given ID from the backend.

       // The data returned by the backend is then used to fill the form.
      // These lines are NOT backend calls; they only store the returned
      // backend data in the frontend state.
        setDonorUserId(data.donor_user_id);
        setReceivingOrgId(data.receiving_organization_id);
        // donation_date may come as "2025-05-12T00:00:00.000Z" — normalise to YYYY-MM-DD
        setDonationDate(
          data.donation_date
            ? String(data.donation_date).split('T')[0]
            : '',
        );
        setDonorNote(data.donor_note ?? '');
        setDonationStatus(data.donation_status ?? 'Pending');
        setMedicineItems(
          data.donation_items?.length
            ? data.donation_items.map((item) => ({
                donation_item_id: item.donation_item_id,
                medicine_id: item.medicine_id,
                batch_number: item.batch_number,
                quantity: item.quantity,
                manufacturing_date: item.manufacturing_date
                  ? String(item.manufacturing_date).split('T')[0]
                  : '',
                expiry_date: item.expiry_date
                  ? String(item.expiry_date).split('T')[0]
                  : '',
                packaging_condition: item.packaging_condition,
                storage_condition: item.storage_condition,
              }))
            : [emptyItem()],
        );
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load donation. The ID may not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [id]);

  const handleAddItem = () => setMedicineItems([...medicineItems, emptyItem()]);

  const handleRemoveItem = (index: number) => {
    if (medicineItems.length > 1) {
      setMedicineItems(medicineItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof EditItem,
    value: string | number,
  ) => {
    const updated = [...medicineItems];
    updated[index] = { ...updated[index], [field]: value };
    setMedicineItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
// 🔴 BACKEND API CALL:
// Sends an update request to the NestJS backend for this donation ID.
// The data inside this object is sent from the frontend to the backend.
    try {
      await api.updateDonation(id, {
        donor_user_id: Number(donor_user_id),
        receiving_organization_id: Number(receiving_organization_id),
        donation_date,
        donation_status,
        donor_note: donor_note || undefined,
        donation_items: medicineItems,
      });
      router.push('/donations');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update donation. Please try again.');
    } finally {
      setSaving(false);
    }
  };
// The backend receives this data and processes the update:
// Frontend → NestJS REST API → DonationsService → DataSource.query() raw SQL → SQL Server.
  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading donation details...</p>
          </div>
        </main>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-800">Edit Donation #{id}</h1>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-700">Error</p>
              <p className="text-xs text-rose-500 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
          {/* Donation Info */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 mb-4">Donation Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Donor User ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={donor_user_id}
                  onChange={(e) =>
                    setDonorUserId(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Receiving Organization ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={receiving_organization_id}
                  onChange={(e) =>
                    setReceivingOrgId(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Donation Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={donation_date}
                  onChange={(e) => setDonationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={donation_status}
                  onChange={(e) => setDonationStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Received">Received</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Donor Note
                </label>
                <input
                  type="text"
                  value={donor_note}
                  onChange={(e) => setDonorNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
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
                <div
                  key={index}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 relative"
                >
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
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Medicine ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={item.medicine_id || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'medicine_id', Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Batch Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={item.batch_number}
                        onChange={(e) =>
                          handleItemChange(index, 'batch_number', e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Quantity <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Manufacturing Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={item.manufacturing_date}
                        onChange={(e) =>
                          handleItemChange(index, 'manufacturing_date', e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Expiry Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={item.expiry_date}
                        onChange={(e) => handleItemChange(index, 'expiry_date', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Packaging Condition
                      </label>
                      <select
                        value={item.packaging_condition}
                        onChange={(e) =>
                          handleItemChange(index, 'packaging_condition', e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Good">Good</option>
                        <option value="Sealed">Sealed</option>
                        <option value="Opened">Opened</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Storage Condition
                      </label>
                      <select
                        value={item.storage_condition}
                        onChange={(e) =>
                          handleItemChange(index, 'storage_condition', e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Room Temperature">Room Temperature</option>
                        <option value="Cool Place">Cool Place</option>
                        <option value="Refrigerated">Refrigerated</option>
                        <option value="Frozen">Frozen</option>
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
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Updating...' : 'Update Donation'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}