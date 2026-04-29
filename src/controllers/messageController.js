const Admin = require('../models/Admin');
const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { USER_ROLES, NOTIFICATION_TYPE } = require('../constants/appConstants');
const { createNotification } = require('../services/notificationService');

const getDefaultAdmin = () => Admin.findOne().select('_id');

const getThreadQuery = (currentRole, currentId, participantId) => {
  const currentModel = currentRole === USER_ROLES.ADMIN ? 'Admin' : 'User';
  const participantModel = currentRole === USER_ROLES.ADMIN ? 'User' : 'Admin';

  return {
    $or: [
      {
        senderId: currentId,
        senderModel: currentModel,
        receiverId: participantId,
        receiverModel: participantModel,
      },
      {
        senderId: participantId,
        senderModel: participantModel,
        receiverId: currentId,
        receiverModel: currentModel,
      },
    ],
  };
};

const listThreads = catchAsync(async (req, res) => {
  const modelName = req.userRole === USER_ROLES.ADMIN ? 'Admin' : 'User';
  const messages = await Message.find({
    $or: [
      { senderId: req.user._id, senderModel: modelName },
      { receiverId: req.user._id, receiverModel: modelName },
    ],
  }).sort({ createdAt: -1 });

  const threads = [];
  const seen = new Set();

  messages.forEach((message) => {
    const counterpartId =
      String(message.senderId) === String(req.user._id) ? String(message.receiverId) : String(message.senderId);

    if (seen.has(counterpartId)) {
      return;
    }

    seen.add(counterpartId);
    threads.push({
      participantId: counterpartId,
      participantModel:
        String(message.senderId) === String(req.user._id) ? message.receiverModel : message.senderModel,
      lastMessage: message,
    });
  });

  return res.json({
    success: true,
    data: threads,
  });
});

const getThread = catchAsync(async (req, res) => {
  const messages = await Message.find(getThreadQuery(req.userRole, req.user._id, req.params.participantId)).sort({
    createdAt: 1,
  });

  await Message.updateMany(
    {
      receiverId: req.user._id,
      receiverModel: req.userRole === USER_ROLES.ADMIN ? 'Admin' : 'User',
      senderId: req.params.participantId,
      isRead: false,
    },
    { $set: { isRead: true } },
  );

  return res.json({
    success: true,
    data: messages,
  });
});

const sendMessage = catchAsync(async (req, res) => {
  let receiverId = req.body.receiverId;
  const receiverModel = req.userRole === USER_ROLES.ADMIN ? 'User' : 'Admin';

  if (req.userRole === USER_ROLES.USER && !receiverId) {
    const admin = await getDefaultAdmin();

    if (!admin) {
      throw new ApiError(404, 'Admin account not found');
    }

    receiverId = admin._id;
  }

  if (!receiverId) {
    throw new ApiError(400, 'Receiver is required');
  }

  const message = await Message.create({
    senderId: req.user._id,
    senderModel: req.userRole === USER_ROLES.ADMIN ? 'Admin' : 'User',
    receiverId,
    receiverModel,
    propertyId: req.body.propertyId || null,
    message: req.body.message,
  });

  await createNotification({
    recipientId: receiverId,
    recipientModel: receiverModel,
    title: 'New message',
    body: req.body.message,
    type: NOTIFICATION_TYPE.MESSAGE,
    data: {
      messageId: String(message._id),
    },
  });

  return res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: message,
  });
});

module.exports = {
  listThreads,
  getThread,
  sendMessage,
};
