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

      {/* Basic Details */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xl font-bold text-blue-600">
          {donation.donationId || donation.id}
        </span>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
          donation.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
          donation.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
          donation.status === 'Received' ? 'bg-blue-50 text-blue-600' :
          'bg-rose-50 text-rose-600'
        }`}>
          {donation.status}
        </span>
      </div>

      <div className="space-y-4 text-sm text-gray-600 border-b border-gray-100 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 min-w-[100px]">Donor:</span>
          <span className="font-semibold text-gray-800">{donation.donor}</span>
        </div>

        <div className="flex items-center gap-3">
          <Building className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 min-w-[100px]">Organization:</span>
          <span className="font-medium text-gray-800">{donation.receivingOrganization}</span>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 min-w-[100px]">Donation Date:</span>
          <span className="text-gray-800">{donation.donationDate}</span>
        </div>

        <div className="flex items-center gap-3">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 min-w-[100px]">Status:</span>
          <span className="text-gray-800">{donation.status}</span>
        </div>

        {donation.donorNote && (
          <div className="flex items-start gap-3 mt-2 bg-gray-50 p-3 rounded-xl">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <span className="text-xs font-medium text-gray-400 block">Note:</span>
              <span className="text-xs text-gray-600">{donation.donorNote}</span>
            </div>
          </div>
        )}
      </div>

      {/* Medicine Items List */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Donation Items ({donation.medicineItems?.length || 0})
          </h3>
        </div>

        <div className="space-y-3">
          {donation.medicineItems?.map((item, idx) => (
            <div key={idx} className="p-3 border border-gray-100 rounded-xl flex justify-between items-center hover:border-blue-100 transition">
              <div>
                <p className="font-semibold text-gray-800 text-xs">{item.medicine}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Batch: {item.batchNumber}</p>
              </div>
              <span className="text-xs font-medium bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">
                {item.quantity} units
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Total */}
      <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
        <span className="text-xl font-extrabold text-blue-600">
        </span>
      </div>
    </div>
  );
}