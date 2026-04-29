const RentalApplication = require('../models/RentalApplication');
const Property = require('../models/Property');
const Document = require('../models/Document');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { APPLICATION_STATUS, NOTIFICATION_TYPE, PROPERTY_STATUS } = require('../constants/appConstants');
const { broadcastToAdmins, createNotification } = require('../services/notificationService');

const getPopulatedApplications = (query) =>
  RentalApplication.find(query)
    .populate('userId', 'fullName email phone occupation income')
    .populate('propertyId')
    .populate('documents');

const createApplication = catchAsync(async (req, res) => {
  const property = await Property.findById(req.body.propertyId);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.status !== PROPERTY_STATUS.AVAILABLE) {
    throw new ApiError(400, 'This property is not available');
  }

  const duplicate = await RentalApplication.findOne({
    userId: req.user._id,
    propertyId: req.body.propertyId,
  });

  if (duplicate) {
    throw new ApiError(409, 'You have already applied for this property');
  }

  const application = await RentalApplication.create({
    userId: req.user._id,
    propertyId: req.body.propertyId,
    personalDetails: req.body.personalDetails,
    remarks: req.body.remarks,
    documents: req.body.documentIds || [],
  });

  if (req.body.documentIds?.length) {
    await Document.updateMany(
      { _id: { $in: req.body.documentIds } },
      {
        $set: {
          ownerType: 'RentalApplication',
          ownerId: application._id,
        },
      },
    );
  }

  await broadcastToAdmins({
    title: 'New rental application',
    body: `${req.user.fullName} applied for ${property.title}.`,
    type: NOTIFICATION_TYPE.APPLICATION,
    data: {
      applicationId: String(application._id),
      propertyId: String(property._id),
    },
  });

  const populatedApplication = await getPopulatedApplications({ _id: application._id });

  return res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: populatedApplication[0],
  });
});

const getMyApplications = catchAsync(async (req, res) => {
  const applications = await getPopulatedApplications({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.json({ success: true, data: applications });
});

const getApplications = catchAsync(async (req, res) => {
  const filters = {};
  if (req.query.status) {
    filters.status = req.query.status;
  }
  if (req.query.propertyId) {
    filters.propertyId = req.query.propertyId;
  }

  const applications = await getPopulatedApplications(filters).sort({ createdAt: -1 });
  return res.json({ success: true, data: applications });
});

const getApplicationById = catchAsync(async (req, res) => {
  const [application] = await getPopulatedApplications({ _id: req.params.id });

  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  if (req.userRole === 'user' && String(application.userId._id) !== String(req.user._id)) {
    throw new ApiError(403, 'Not allowed to view this application');
  }

  return res.json({ success: true, data: application });
});

const updateApplicationStatus = catchAsync(async (req, res) => {
  const application = await RentalApplication.findById(req.params.id).populate('propertyId userId');

  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  application.status = req.body.status || application.status;
  application.adminRemarks = req.body.adminRemarks || application.adminRemarks;
  await application.save();

  if (application.status === APPLICATION_STATUS.APPROVED && req.body.assignTenant) {
    await Property.findByIdAndUpdate(application.propertyId._id, {
      tenantId: application.userId._id,
      status: PROPERTY_STATUS.OCCUPIED,
    });
  }

  await createNotification({
    recipientId: application.userId._id,
    recipientModel: 'User',
    title: 'Application update',
    body: `Your application for ${application.propertyId.title} is now ${application.status.replace('_', ' ')}.`,
    type: NOTIFICATION_TYPE.APPLICATION,
    data: {
      applicationId: String(application._id),
    },
  });

  return res.json({
    success: true,
    message: 'Application updated successfully',
    data: application,
  });
});

module.exports = {
  createApplication,
  getMyApplications,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
};
