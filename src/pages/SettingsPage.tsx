import { useState } from 'react';
import { Bell, Globe, Shield, LogOut } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors',
        enabled ? 'bg-primary-600' : 'bg-slate-200'
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5',
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    settlements: true,
    newExpenses: true,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your app preferences and account." />

      <div className="space-y-6">
        {/* Notifications */}
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <Bell className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
              <p className="text-sm text-slate-500">Choose what updates you want to receive.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {[
              { key: 'email' as const, label: 'Email notifications', desc: 'Receive notifications via email' },
              { key: 'push' as const, label: 'Push notifications', desc: 'Receive push notifications in browser' },
              { key: 'settlements' as const, label: 'Settlement reminders', desc: 'Get reminded about pending settlements' },
              { key: 'newExpenses' as const, label: 'New expense alerts', desc: 'Get notified when someone adds an expense' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <Toggle
                  enabled={notifications[item.key]}
                  onChange={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Preferences</h2>
              <p className="text-sm text-slate-500">Customize your app experience.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Default currency</p>
                <p className="text-xs text-slate-500">Used when creating new expenses</p>
              </div>
              <select className="input-field w-auto">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Theme</p>
                <p className="text-xs text-slate-500">Choose your preferred theme</p>
              </div>
              <select className="input-field w-auto">
                <option>Light</option>
                <option>Dark (coming soon)</option>
                <option>System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Shield className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Security</h2>
              <p className="text-sm text-slate-500">Manage your account security.</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button className="btn-secondary w-full sm:w-auto">Change password</button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card border-red-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <LogOut className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Account</h2>
              <p className="text-sm text-slate-500">Sign out or delete your account.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={logout} className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-300">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
            <button className="btn-ghost text-red-600 hover:bg-red-50">
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
