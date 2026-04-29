const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { PROPERTY_STATUS } = require('../constants/appConstants');

const buildFilters = (query, isAdmin) => {
  const filters = {};

  if (query.type) {
    filters.type = query.type;
  }

  if (query.city) {
    filters['address.city'] = new RegExp(query.city, 'i');
  }

  if (query.availability) {
    filters.status = query.availability;
  } else if (!isAdmin) {
    filters.status = PROPERTY_STATUS.AVAILABLE;
  }

  if (query.minRent || query.maxRent) {
    filters.rent = {};
    if (query.minRent) {
      filters.rent.$gte = Number(query.minRent);
    }
    if (query.maxRent) {
      filters.rent.$lte = Number(query.maxRent);
    }
  }

  if (query.bedrooms) {
    filters.bedrooms = Number(query.bedrooms);
  }

  if (query.search) {
    filters.$text = { $search: query.search };
  }

  return filters;
};

const listProperties = catchAsync(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 12);
  const sort = req.query.sort || '-createdAt';
  const isAdmin = req.userRole === 'admin';
  const filters = buildFilters(req.query, isAdmin);

  const [items, total] = await Promise.all([
    Property.find(filters)
      .populate('tenantId', 'fullName email phone')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Property.countDocuments(filters),
  ]);

  return res.json({
    success: true,
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

const getPropertyById = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.id).populate('tenantId', 'fullName email phone');

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  return res.json({
    success: true,
    data: property,
  });
});

const createProperty = catchAsync(async (req, res) => {
  const property = await Property.create({
    ...req.body,
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: 'Property created successfully',
    data: property,
  });
});

const updateProperty = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  Object.assign(property, req.body);
  await property.save();

  return res.json({
    success: true,
    message: 'Property updated successfully',
    data: property,
  });
});

const deleteProperty = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  await property.deleteOne();

  return res.json({
    success: true,
    message: 'Property deleted successfully',
  });
});

module.exports = {
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
