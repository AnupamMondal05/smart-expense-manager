import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { notificationService, type Notification } from '@/services/notificationService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const load = () => notificationService.getAll().then((data) => setNotifications(data.notifications));
  useEffect(() => { load(); }, []);
  const markAllRead = async () => { await notificationService.markAllRead(); load(); };
  const markRead = async (id: string) => { await notificationService.markRead(id); load(); };

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Stay updated on expense activity and settlements." action={<button onClick={markAllRead} className="btn-secondary"><CheckCheck className="h-4 w-4" />Mark all read</button>} />
      {!notifications.length ? <EmptyState icon={Bell} title="No notifications" description="You'll receive notifications here when someone adds an expense, joins a group, or settles a balance." /> : (
        <div className="card divide-y divide-slate-100">
          {notifications.map((notification) => <button key={notification._id} onClick={() => !notification.read && markRead(notification._id)} className={`flex w-full items-start gap-4 p-5 text-left hover:bg-slate-50 ${notification.read ? '' : 'bg-primary-50/50'}`}><Bell className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" /><span className="flex-1"><span className="block text-sm text-slate-800">{notification.message}</span><span className="mt-1 block text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</span></span>{!notification.read && <span className="mt-2 h-2 w-2 rounded-full bg-primary-600" />}</button>)}
        </div>
      )}
    </div>
  );
}
