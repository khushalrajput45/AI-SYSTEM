import { Notification } from '../models/Notification.js';

export async function getMyNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
    } else {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }

    return res.status(200).json({
      success: true,
      message: 'Notifications marked as read.',
    });
  } catch (err) {
    next(err);
  }
}

export async function clearAllNotifications(req, res, next) {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    return res.status(200).json({
      success: true,
      message: 'All notifications cleared successfully.',
    });
  } catch (err) {
    next(err);
  }
}
