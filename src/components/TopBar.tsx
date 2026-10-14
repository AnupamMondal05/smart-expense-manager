import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, LogOut, ChevronDown } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/format';
import { notificationService } from '@/services/notificationService';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationService.getAll().then((data) => setUnreadCount(data.unreadCount)).catch(() => setUnreadCount(0));
  }, [user]);

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user ? getInitials(fullName) : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-slate-200/70 bg-[#f7f9fc]/80 px-4 backdrop-blur-md transition-colors duration-200 dark:border-slate-700 dark:bg-slate-950/80 sm:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 sm:block sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search..."
          aria-label="Search expenses and groups"
          className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-9 pr-4 text-sm text-slate-700 placeholder-slate-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:bg-slate-900"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-initial">
        <ThemeToggle />
        <button onClick={() => navigate('/notifications')} className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-primary-600 px-1 text-[10px] font-bold leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>
        <button onClick={() => navigate('/profile')} className="hidden items-center gap-2 rounded-xl p-1.5 pr-2 text-left transition-colors hover:bg-white dark:hover:bg-slate-900 sm:flex" aria-label="Open profile">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">{initials}</div>
          <span className="max-w-24 truncate text-sm font-semibold text-slate-700 dark:text-slate-100">{user?.firstName}</span>
          <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </button>
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
