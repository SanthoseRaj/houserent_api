const Agreement = require('../models/Agreement');
const Document = require('../models/Document');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { uploadFile } = require('../services/storageService');

const createAgreement = catchAsync(async (req, res) => {
  let agreementFileUrl = req.body.agreementFileUrl;
  let documentId = req.body.documentId || null;

  if (req.file) {
    const uploaded = await uploadFile(req.file, 'documents');
    const document = await Document.create({
      ownerType: 'Agreement',
      label: req.body.title || req.file.originalname,
      category: 'agreement',
      url: uploaded.url,
      publicId: uploaded.publicId,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      resourceType: uploaded.resourceType,
      uploadedById: req.user._id,
      uploadedByModel: 'Admin',
    });

    agreementFileUrl = uploaded.url;
    documentId = document._id;
  }

  const agreement = await Agreement.create({
    userId: req.body.userId,
    propertyId: req.body.propertyId,
    applicationId: req.body.applicationId || null,
    title: req.body.title,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    rent: req.body.rent,
    agreementFileUrl,
    documentId,
    status: req.body.status || 'active',
    uploadedBy: req.user._id,
  });

  if (documentId) {
    await Document.findByIdAndUpdate(documentId, {
      ownerId: agreement._id,
      ownerType: 'Agreement',
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Agreement uploaded successfully',
    data: agreement,
  });
});

const getAgreements = catchAsync(async (req, res) => {
  const filters = req.userRole === 'admin' ? {} : { userId: req.user._id };
  const agreements = await Agreement.find(filters)
    .populate('propertyId')
    .populate('userId', 'fullName email')
    .sort({ createdAt: -1 });

  return res.json({
    success: true,
    data: agreements,
  });
});

const getAgreementById = catchAsync(async (req, res) => {
  const agreement = await Agreement.findById(req.params.id).populate('propertyId').populate('userId', 'fullName email');

  if (!agreement) {
    throw new ApiError(404, 'Agreement not found');
  }

  if (req.userRole !== 'admin' && String(agreement.userId._id) !== String(req.user._id)) {
    throw new ApiError(403, 'Not allowed to view this agreement');
  }

  return res.json({
    success: true,
    data: agreement,
  });
});

module.exports = {
  createAgreement,
  getAgreements,
  getAgreementById,
};
