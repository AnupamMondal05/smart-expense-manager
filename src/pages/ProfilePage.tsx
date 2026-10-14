import { User, Mail, Calendar, Save } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { getInitials, formatDate } from '@/utils/format';
import { useToast } from '@/context/ToastContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user ? getInitials(fullName) : '';

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your personal information." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="card p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
              {initials}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{fullName}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            {user?.createdAt && (
              <p className="mt-1 text-xs text-slate-400">Joined {formatDate(user.createdAt)}</p>
            )}
            <button className="btn-secondary mt-4 w-full">Change avatar</button>
          </div>
        </div>

        {/* Edit form */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Personal information</h2>
          <form onSubmit={(event) => { event.preventDefault(); toast('Profile preferences saved'); }} className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">First name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    defaultValue={user?.firstName || ''}
                    placeholder="John"
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Last name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    defaultValue={user?.lastName || ''}
                    placeholder="Doe"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Preferred currency</label>
              <select className="input-field">
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Timezone</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select className="input-field pl-10">
                  <option>UTC-08:00 Pacific</option>
                  <option>UTC-05:00 Eastern</option>
                  <option>UTC+00:00 GMT</option>
                  <option>UTC+01:00 Central European</option>
                  <option>UTC+05:30 India</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                <Save className="h-4 w-4" />
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
