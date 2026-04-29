const Complaint = require('../models/Complaint');
const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { NOTIFICATION_TYPE } = require('../constants/appConstants');
const { broadcastToAdmins, createNotification } = require('../services/notificationService');

const createComplaint = catchAsync(async (req, res) => {
  const property = await Property.findById(req.body.propertyId);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const complaint = await Complaint.create({
    userId: req.user._id,
    propertyId: req.body.propertyId,
    subject: req.body.subject,
    description: req.body.description,
  });

  await broadcastToAdmins({
    title: 'New complaint submitted',
    body: req.body.subject,
    type: NOTIFICATION_TYPE.COMPLAINT,
    data: {
      complaintId: String(complaint._id),
    },
  });

  return res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully',
    data: complaint,
  });
});

const getComplaints = catchAsync(async (req, res) => {
  const filters = req.userRole === 'admin' ? {} : { userId: req.user._id };
  const complaints = await Complaint.find(filters).populate('propertyId').populate('userId', 'fullName email').sort({
    createdAt: -1,
  });

  return res.json({
    success: true,
    data: complaints,
  });
});

const updateComplaint = catchAsync(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  complaint.status = req.body.status || complaint.status;
  complaint.adminReply = req.body.adminReply || complaint.adminReply;
  await complaint.save();

  await createNotification({
    recipientId: complaint.userId,
    recipientModel: 'User',
    title: 'Complaint updated',
    body: `Your complaint "${complaint.subject}" is now ${complaint.status.replace('_', ' ')}.`,
    type: NOTIFICATION_TYPE.COMPLAINT,
    data: {
      complaintId: String(complaint._id),
    },
  });

  return res.json({
    success: true,
    message: 'Complaint updated successfully',
    data: complaint,
  });
});

module.exports = {
  createComplaint,
  getComplaints,
  updateComplaint,
};
