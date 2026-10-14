import Notification from '../models/Notification.js';

export async function createNotifications(notifications) {
  if (!notifications.length) return;
  await Notification.insertMany(notifications);
}
