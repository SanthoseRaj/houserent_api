const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const { NOTIFICATION_TYPE, USER_ROLES } = require('../constants/appConstants');
const { broadcastToUsers, broadcastToAdmins } = require('../services/notificationService');

const getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({
    recipientId: req.user._id,
    recipientModel: req.userRole === USER_ROLES.ADMIN ? 'Admin' : 'User',
  }).sort({ createdAt: -1 });

  return res.json({
    success: true,
    data: notifications,
  });
});

const markAsRead = catchAsync(async (req, res) => {
  await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      recipientId: req.user._id,
    },
    { $set: { isRead: true } },
  );

  return res.json({
    success: true,
    message: 'Notification marked as read',
  });
});

const createAnnouncement = catchAsync(async (req, res) => {
  const recipients = req.body.audience === 'admins' ? broadcastToAdmins : broadcastToUsers;
  await recipients({
    title: req.body.title,
    body: req.body.body,
    type: NOTIFICATION_TYPE.ANNOUNCEMENT,
  });

  return res.status(201).json({
    success: true,
    message: 'Announcement sent successfully',
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  createAnnouncement,
};
