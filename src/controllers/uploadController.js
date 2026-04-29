const Document = require('../models/Document');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { uploadFile } = require('../services/storageService');

const parseLabels = (value, count) => {
  if (!value) {
    return Array.from({ length: count }, (_, index) => `Document ${index + 1}`);
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return [value];
  }
};

const uploadDocuments = catchAsync(async (req, res) => {
  if (!req.files?.length) {
    throw new ApiError(400, 'At least one file is required');
  }

  const labels = parseLabels(req.body.labels, req.files.length);
  const documents = await Promise.all(
    req.files.map(async (file, index) => {
      const uploaded = await uploadFile(file, 'documents');
      return Document.create({
        ownerType: req.body.ownerType || 'Unknown',
        ownerId: req.body.ownerId || null,
        label: labels[index] || file.originalname,
        category: req.body.category || 'general',
        url: uploaded.url,
        publicId: uploaded.publicId,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
        resourceType: uploaded.resourceType,
        uploadedById: req.user._id,
        uploadedByModel: req.userModel,
      });
    }),
  );

  return res.status(201).json({
    success: true,
    message: 'Documents uploaded successfully',
    data: documents,
  });
});

const uploadPropertyImages = catchAsync(async (req, res) => {
  if (!req.files?.length) {
    throw new ApiError(400, 'At least one image is required');
  }

  const images = await Promise.all(req.files.map((file) => uploadFile(file, 'properties')));

  return res.status(201).json({
    success: true,
    message: 'Images uploaded successfully',
    data: images.map((image) => ({ url: image.url, publicId: image.publicId })),
  });
});

const updateDocumentStatus = catchAsync(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  document.verificationStatus = req.body.verificationStatus || document.verificationStatus;
  document.notes = req.body.notes || document.notes;
  await document.save();

  return res.json({
    success: true,
    message: 'Document status updated successfully',
    data: document,
  });
});

module.exports = {
  uploadDocuments,
  uploadPropertyImages,
  updateDocumentStatus,
};
