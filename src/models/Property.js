const mongoose = require('mongoose');
const { PROPERTY_STATUS, PROPERTY_TYPES } = require('../constants/appConstants');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(PROPERTY_TYPES),
      required: true,
    },
    category: {
      type: String,
      default: 'rent',
    },
    address: {
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      area: String,
      state: String,
      pincode: String,
    },
    rent: {
      type: Number,
      required: true,
    },
    deposit: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    amenities: [String],
    status: {
      type: String,
      enum: Object.values(PROPERTY_STATUS),
      default: PROPERTY_STATUS.AVAILABLE,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    floorSize: String,
    bedrooms: Number,
    bathrooms: Number,
    shopSize: String,
    businessSuitability: String,
    availableFrom: Date,
    ownerContactPhone: String,
    ownerContactEmail: String,
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

propertySchema.index({ 'address.city': 1, type: 1, status: 1 });
propertySchema.index({ title: 'text', description: 'text', 'address.city': 'text', 'address.area': 'text' });

module.exports = mongoose.model('Property', propertySchema);
