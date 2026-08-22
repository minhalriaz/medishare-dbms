import Link from 'next/link';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  Pill, 
  FileText, 
  Building2, 
  Users, 
  BarChart2, 
  Settings,
  HandHeart,
  Heart
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '#' },
    { name: 'Donations', icon: HeartHandshake, href: '/donations', active: true },
    { name: 'Medicine Inventory', icon: Pill, href: '#' },
    { name: 'Requests', icon: FileText, href: '#' },
    { name: 'Organizations', icon: Building2, href: '#' },
    { name: 'Donors', icon: Users, href: '#' },
    { name: 'Reports', icon: BarChart2, href: '#' },
    { name: 'Settings', icon: Settings, href: '#' },
  ];

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col justify-between fixed left-0 top-0 z-10">
      <div>
        {/* Brand Logo with Lucide Icon */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <HandHeart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Medi<span className="text-emerald-600">Share</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              Free Medicine Donation
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-2 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner with Lucide Icon */}
      <div className="p-4 m-4 bg-emerald-50 rounded-2xl border border-emerald-100">
        <div className="text-emerald-600 mb-2">
          <Heart className="w-5 h-5 fill-emerald-600" />
        </div>
        <h4 className="text-sm font-semibold text-emerald-900">Every donation makes a difference</h4>
        <p className="text-xs text-emerald-700 mt-1">Thank you for being part of MediShare.</p>
      </div>
    </aside>
  );
}