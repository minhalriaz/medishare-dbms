'use client';

import { Donation } from '@/types/donation';
import { X, User, Building, Calendar, Tag, FileText, Package } from 'lucide-react';

interface Props {
  donation: Donation | null;
  onClose: () => void;
}

export default function DonationDetailsPanel({ donation, onClose }: Props) {
  if (!donation) return null;

  return (
    <div className="w-96 bg-white border-l border-gray-100 p-6 flex flex-col h-screen sticky top-0 shadow-xl z-20 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Donation Details</h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Donation ID + Status */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xl font-bold text-blue-600">
          DON-{String(donation.donation_id).padStart(6, '0')}
        </span>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            donation.donation_status === 'Completed'
              ? 'bg-emerald-50 text-emerald-600'
              : donation.donation_status === 'Pending'
              ? 'bg-amber-50 text-amber-600'
              : donation.donation_status === 'Received'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-rose-50 text-rose-600'
          }`}
        >
          {donation.donation_status}
        </span>
      </div>

      {/* Basic Details */}
      <div className="space-y-4 text-sm text-gray-600 border-b border-gray-100 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 min-w-[120px]">Donor User ID:</span>
          <span className="font-semibold text-gray-800">#{donation.donor_user_id}</span>
        </div>

        <div className="flex items-center gap-3">
          <Building className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 min-w-[120px]">Organization ID:</span>
          <span className="font-medium text-gray-800">#{donation.receiving_organization_id}</span>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 min-w-[120px]">Donation Date:</span>
          <span className="text-gray-800">
            {donation.donation_date
              ? new Date(donation.donation_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '—'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 min-w-[120px]">Status:</span>
          <span className="text-gray-800">{donation.donation_status}</span>
        </div>

        {donation.donor_note && (
          <div className="flex items-start gap-3 mt-2 bg-gray-50 p-3 rounded-xl">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <span className="text-xs font-medium text-gray-400 block">Note:</span>
              <span className="text-xs text-gray-600">{donation.donor_note}</span>
            </div>
          </div>
        )}
      </div>

      {/* Medicine Items List */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Donation Items ({donation.donation_items?.length ?? 0})
          </h3>
        </div>

        <div className="space-y-3">
          {donation.donation_items?.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No medicine items attached.</p>
          )}
          {donation.donation_items?.map((item, idx) => (
            <div
              key={item.donation_item_id ?? idx}
              className="p-3 border border-gray-100 rounded-xl hover:border-blue-100 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 text-xs">
                    {item.medicine_name
                      ? `${item.medicine_name} (ID: #${item.medicine_id})`
                      : `Medicine ID: #${item.medicine_id}`}
                  </p>
                  {item.generic_name && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Generic: {item.generic_name}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-0.5">Batch: {item.batch_number}</p>
                  <p className="text-[11px] text-gray-400">
                    Expires:{' '}
                    {item.expiry_date
                      ? new Date(item.expiry_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </p>
                  <p className="text-[11px] text-gray-400">Packaging: {item.packaging_condition}</p>
                  <p className="text-[11px] text-gray-400">Storage: {item.storage_condition}</p>
                </div>
                <span className="text-xs font-medium bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600 flex-shrink-0 ml-2">
                  {item.quantity} units
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100 mt-auto">
        <p className="text-[11px] text-gray-400 text-center">
          Internal ID: {donation.donation_id}
        </p>
      </div>
    </div>
  );
}