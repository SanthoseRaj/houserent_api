const mongoose = require('mongoose');
const { DOCUMENT_STATUS } = require('../constants/appConstants');

const documentSchema = new mongoose.Schema(
  {
    ownerType: {
      type: String,
      enum: ['User', 'RentalApplication', 'Agreement', 'Property', 'Unknown'],
      default: 'Unknown',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'general',
    },
    url: {
      type: String,
      required: true,
    },
    publicId: String,
    mimeType: String,
    size: Number,
    resourceType: String,
    verificationStatus: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.PENDING,
    },
    uploadedById: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'uploadedByModel',
    },
    uploadedByModel: {
      type: String,
      enum: ['Admin', 'User'],
    },
    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Document', documentSchema);
