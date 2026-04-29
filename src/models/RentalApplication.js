const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../constants/appConstants');

const rentalApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.SUBMITTED,
    },
    personalDetails: {
      fullName: String,
      fatherName: String,
      mobileNumber: String,
      alternateMobileNumber: String,
      email: String,
      currentAddress: String,
      permanentAddress: String,
      aadhaarNumber: String,
      occupation: String,
      monthlyIncome: Number,
      familyMembersCount: Number,
      businessType: String,
      requiredRentalStartDate: Date,
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    remarks: String,
    adminRemarks: String,
  },
  { timestamps: true },
);

rentalApplicationSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('RentalApplication', rentalApplicationSchema);
