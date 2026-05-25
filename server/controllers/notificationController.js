const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ read: 1, createdAt: -1 })
    .limit(50);

  return successResponse(res, 200, 'Notifications retrieved', notifications);
});

// PATCH /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
  if (!notification) {
    return errorResponse(res, 404, 'Notification not found');
  }

  notification.read = true;
  await notification.save();

  return successResponse(res, 200, 'Notification marked as read', notification);
});

// PATCH /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, read: false },
    { $set: { read: true } }
  );

  return successResponse(res, 200, 'All notifications marked as read');
});

module.exports = {
  getNotifications,
  markRead,
  markAllRead
};
