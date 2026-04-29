const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

const USER_STATUS = {
  PENDING_VERIFICATION: 'pending_verification',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

const PROPERTY_TYPES = {
  HOUSE: 'house',
  SHOP: 'shop',
};

const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  DRAFT: 'draft',
};

const APPLICATION_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const DOCUMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

const COMPLAINT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

const NOTIFICATION_TYPE = {
  GENERAL: 'general',
  APPLICATION: 'application',
  PAYMENT: 'payment',
  MESSAGE: 'message',
  COMPLAINT: 'complaint',
  ANNOUNCEMENT: 'announcement',
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  PROPERTY_TYPES,
  PROPERTY_STATUS,
  APPLICATION_STATUS,
  DOCUMENT_STATUS,
  PAYMENT_STATUS,
  COMPLAINT_STATUS,
  NOTIFICATION_TYPE,
};
