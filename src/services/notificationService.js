const Admin = require('../models/Admin');
const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async ({ recipientId, recipientModel, title, body, type, data = {} }) =>
  Notification.create({
    recipientId,
    recipientModel,
    title,
    body,
    type,
    data,
  });

const broadcastToAdmins = async ({ title, body, type, data = {} }) => {
  const admins = await Admin.find().select('_id');
  return Promise.all(
    admins.map((admin) =>
      createNotification({
        recipientId: admin._id,
        recipientModel: 'Admin',
        title,
        body,
        type,
        data,
      }),
    ),
  );
};

const broadcastToUsers = async ({ title, body, type, data = {} }) => {
  const users = await User.find().select('_id');
  return Promise.all(
    users.map((user) =>
      createNotification({
        recipientId: user._id,
        recipientModel: 'User',
        title,
        body,
        type,
        data,
      }),
    ),
  );
};

module.exports = {
  createNotification,
  broadcastToAdmins,
  broadcastToUsers,
};
