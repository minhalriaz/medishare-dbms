import { HandHeart } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* Icon Container */}
      <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm">
        <HandHeart className="w-5 h-5" />
      </div>

      {/* Brand Name */}
      <div className="flex flex-col">
        <span className="font-bold text-base text-gray-900 leading-tight">
          Medi<span className="text-emerald-600">Share</span>
        </span>
        <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">
          Free Medicine
        </span>
      </div>
    </div>
  );
}