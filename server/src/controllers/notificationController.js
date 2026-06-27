const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getNotifications = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    notifications,
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification non trouvée.', 404));
  }

  if (notification.user.toString() !== req.user.id) {
    return next(new AppError('Non autorisé.', 403));
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({ success: true, notification });
});

exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({ success: true, message: 'Toutes les notifications marquées comme lues.' });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification non trouvée.', 404));
  }

  if (notification.user.toString() !== req.user.id) {
    return next(new AppError('Non autorisé.', 403));
  }

  await notification.deleteOne();
  res.status(200).json({ success: true, message: 'Notification supprimée.' });
});
