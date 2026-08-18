'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Building2,
  FileText,
  HandHeart,
  HeartHandshake,
  LayoutDashboard,
  Pill,
  Settings,
  Users,
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Donations', icon: HeartHandshake, href: '/donations' },
  { name: 'Medicine Inventory', icon: Pill, href: '/inventory' },
  { name: 'Requests', icon: FileText, href: '#' },
  { name: 'Organizations', icon: Building2, href: '#' },
  { name: 'Users', icon: Users, href: '#' },
  { name: 'Reports', icon: BarChart2, href: '#' },
  { name: 'Settings', icon: Settings, href: '#' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col justify-between border-r border-gray-200 bg-white lg:flex">
      <div>
        <div className="flex items-center gap-3 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <HandHeart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-gray-900">
              Medi<span className="text-emerald-600">Share</span>
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Free Medicine Donation
            </p>
          </div>
        </div>

        <nav className="mt-2 space-y-1 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href !== '#' &&
              (pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(`${item.href}/`)));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-100 p-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
          <p className="text-xs font-semibold text-emerald-800">MediShare Admin</p>
          <p className="mt-1 text-[11px] leading-4 text-emerald-700/70">
            Manage donations and medicine distribution from one place.
          </p>
        </div>
      </div>
    </aside>
  );
}
