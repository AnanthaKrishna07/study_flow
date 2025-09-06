'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Target,
  CheckSquare,
  Calendar,
  Clock,
  TrendingUp,
  BookOpen,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';

type NavLink = {
  name: string;
  href: string;
  icon: LucideIcon;
};

const LINKS: NavLink[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Target },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Timetable', href: '/timetable', icon: Clock },
  { name: 'Events', href: '/events', icon: AlertCircle },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: BookOpen },
];

function classNames(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? '/';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-800 text-white flex flex-col shadow-xl z-40">
      {/* Brand */}
      <div className="h-16 flex items-center justify-center border-b border-slate-700 px-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
            SF
          </div>
          <h1 className="text-lg font-semibold tracking-wide">StudyFlow</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {LINKS.map(({ name, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={classNames(
                'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4 text-xs text-slate-400">
        <div className="mb-1">© {new Date().getFullYear()} StudyFlow</div>
        <div className="text-[10px]">v1.0.0</div>
      </div>
    </aside>
  );
}
