const env = require('../config/env');

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const jsonContent = (schema) => ({ 'application/json': { schema } });
const jsonRequest = (schema) => ({ required: true, content: jsonContent(schema) });
const multipartRequest = (schema) => ({
  required: true,
  content: { 'multipart/form-data': { schema } },
});
const jsonResponse = (description, schema = ref('GenericSuccess')) => ({
  description,
  content: jsonContent(schema),
});
const idParam = (name, description) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'string' },
});
const bearer = [{ bearerAuth: [] }];

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'HouseRent Pro API',
    version: '1.0.0',
    description:
      'Interactive Swagger docs for the backend. Login or signup first, then paste the JWT in Authorize as `Bearer <token>`.',
  },
  servers: [
    {
      url: env.appBaseUrl || `http://localhost:${env.port}`,
      description: 'Configured backend server',
    },
  ],
  tags: [
    { name: 'System' },
    { name: 'Auth' },
    { name: 'Properties' },
    { name: 'Applications' },
    { name: 'Payments' },
    { name: 'Messages' },
    { name: 'Complaints' },
    { name: 'Notifications' },
    { name: 'Agreements' },
    { name: 'Uploads' },
    { name: 'Admin' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      GenericSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Request completed successfully' },
          data: { type: 'object', nullable: true, additionalProperties: true },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: { type: 'array', items: { type: 'object', additionalProperties: true } },
        },
      },
      AuthSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            properties: {
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              user: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
      UserSignupRequest: {
        type: 'object',
        required: ['fullName', 'email', 'phone', 'password'],
        properties: {
          fullName: { type: 'string', example: 'Santhose' },
          email: { type: 'string', format: 'email', example: 'tenant@example.com' },
          phone: { type: 'string', example: '8072411545' },
          password: { type: 'string', format: 'password', example: 'Tenant@123' },
          occupation: { type: 'string', example: 'Engineer' },
          aadhaarNumber: { type: 'string', example: '234567890123' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['phone', 'password'],
        properties: {
          phone: { type: 'string', example: '8072411545' },
          password: { type: 'string', format: 'password', example: 'Tenant@123' },
        },
      },
      VerifyOtpRequest: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: { type: 'string', format: 'email', example: 'tenant@example.com' },
          otp: { type: 'string', example: '123456' },
          accountType: { type: 'string', enum: ['user', 'admin'], example: 'user' },
        },
      },
      EmailOnlyRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'tenant@example.com' },
          accountType: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          purpose: { type: 'string', example: 'signup' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['email', 'otp', 'newPassword'],
        properties: {
          email: { type: 'string', format: 'email', example: 'tenant@example.com' },
          otp: { type: 'string', example: '123456' },
          accountType: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          newPassword: { type: 'string', format: 'password', example: 'NewPass@123' },
        },
      },
      ProfileUpdateRequest: {
        type: 'object',
        properties: {
          fullName: { type: 'string', example: 'Santhose Kumar' },
          name: { type: 'string', example: 'Admin User' },
          phone: { type: 'string', example: '8072411545' },
          alternatePhone: { type: 'string', example: '9876543210' },
          occupation: { type: 'string', example: 'Engineer' },
          income: { type: 'number', example: 40000 },
          aadhaarNumber: { type: 'string', example: '234567890123' },
          profilePhotoUrl: { type: 'string', format: 'uri' },
          address: {
            type: 'object',
            properties: {
              current: { type: 'string', example: 'Chennai' },
              permanent: { type: 'string', example: 'Madurai' },
            },
          },
        },
      },
      PropertyRequest: {
        type: 'object',
        required: ['title', 'type', 'address', 'rent', 'deposit', 'description'],
        properties: {
          title: { type: 'string', example: '2BHK Family House' },
          type: { type: 'string', enum: ['house', 'shop'], example: 'house' },
          address: {
            type: 'object',
            properties: {
              line1: { type: 'string', example: '12 Lake View Road' },
              city: { type: 'string', example: 'Chennai' },
              area: { type: 'string', example: 'Velachery' },
            },
          },
          rent: { type: 'number', example: 15000 },
          deposit: { type: 'number', example: 50000 },
          description: { type: 'string', example: 'Spacious house with parking.' },
          status: {
            type: 'string',
            enum: ['available', 'occupied', 'maintenance', 'draft'],
            example: 'available',
          },
        },
      },
      ApplicationCreateRequest: {
        type: 'object',
        required: ['propertyId', 'personalDetails'],
        properties: {
          propertyId: { type: 'string', example: '69e1e01d57d04df647bc94a6' },
          personalDetails: {
            type: 'object',
            properties: {
              fullName: { type: 'string', example: 'Santhose' },
              mobileNumber: { type: 'string', example: '8072411545' },
              email: { type: 'string', format: 'email', example: 'tenant@example.com' },
              currentAddress: { type: 'string', example: 'Chennai' },
              permanentAddress: { type: 'string', example: 'Madurai' },
              aadhaarNumber: { type: 'string', example: '234567890123' },
            },
          },
        },
      },
      StatusRequest: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'active' },
          adminReply: { type: 'string', example: 'Issue fixed' },
          notes: { type: 'string', example: 'Verified against original document' },
          verificationStatus: { type: 'string', example: 'verified' },
        },
      },
      CheckoutSessionRequest: {
        type: 'object',
        required: ['propertyId'],
        properties: {
          propertyId: { type: 'string', example: '69e1e01d57d04df647bc94a6' },
          amount: { type: 'number', example: 15000 },
          month: { type: 'string', example: 'April 2026' },
        },
      },
      MessageRequest: {
        type: 'object',
        required: ['message'],
        properties: {
          receiverId: { type: 'string', example: '69e1e01d57d04df647bc94b1' },
          propertyId: { type: 'string', example: '69e1e01d57d04df647bc94a6' },
          message: { type: 'string', example: 'I want to know more about this property.' },
        },
      },
      ComplaintRequest: {
        type: 'object',
        required: ['propertyId', 'subject', 'description'],
        properties: {
          propertyId: { type: 'string', example: '69e1e01d57d04df647bc94a6' },
          subject: { type: 'string', example: 'Water leakage' },
          description: { type: 'string', example: 'There is a leak in the kitchen.' },
        },
      },
      AnnouncementRequest: {
        type: 'object',
        required: ['title', 'body'],
        properties: {
          title: { type: 'string', example: 'Office holiday' },
          body: { type: 'string', example: 'The office will be closed on Sunday.' },
          audience: { type: 'string', enum: ['users', 'admins'], example: 'users' },
        },
      },
      AgreementRequest: {
        type: 'object',
        required: ['userId', 'propertyId', 'title', 'startDate', 'endDate', 'rent'],
        properties: {
          userId: { type: 'string', example: '69e1e01d57d04df647bc94a6' },
          propertyId: { type: 'string', example: '69e1e01d57d04df647bc94b1' },
          applicationId: { type: 'string', example: '69e1e01d57d04df647bc94c1' },
          title: { type: 'string', example: 'Rental Agreement - April 2026' },
          startDate: { type: 'string', format: 'date', example: '2026-04-17' },
          endDate: { type: 'string', format: 'date', example: '2027-04-16' },
          rent: { type: 'number', example: 15000 },
          status: { type: 'string', enum: ['draft', 'active', 'expired'], example: 'active' },
          agreementFileUrl: { type: 'string', format: 'uri' },
          documentId: { type: 'string' },
          file: { type: 'string', format: 'binary' },
        },
      },
      DocumentUploadRequest: {
        type: 'object',
        required: ['files'],
        properties: {
          files: { type: 'array', items: { type: 'string', format: 'binary' } },
          labels: { type: 'string', example: '["Aadhaar Front","Aadhaar Back"]' },
          ownerType: {
            type: 'string',
            enum: ['User', 'RentalApplication', 'Agreement', 'Property', 'Unknown'],
            example: 'User',
          },
          ownerId: { type: 'string', example: '69e1e01d57d04df647bc94a6' },
          category: { type: 'string', example: 'identity' },
        },
      },
      PropertyImagesUploadRequest: {
        type: 'object',
        required: ['files'],
        properties: {
          files: { type: 'array', items: { type: 'string', format: 'binary' } },
        },
      },
      AdminCreateRequest: {
        type: 'object',
        required: ['name', 'phone', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Admin User' },
          phone: { type: 'string', example: '9876543210' },
          email: { type: 'string', format: 'email', example: 'admin@example.com' },
          password: { type: 'string', format: 'password', example: 'Admin@123' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          200: jsonResponse('API is running'),
        },
      },
    },
    '/api/v1/auth/user/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Create a tenant account',
        requestBody: jsonRequest(ref('UserSignupRequest')),
        responses: {
          201: jsonResponse('Account created successfully', ref('AuthSuccess')),
          409: jsonResponse('User already exists', ref('ApiError')),
        },
      },
    },
    '/api/v1/auth/user/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login as user',
        requestBody: jsonRequest(ref('LoginRequest')),
        responses: {
          200: jsonResponse('Login successful', ref('AuthSuccess')),
          401: jsonResponse('Invalid credentials', ref('ApiError')),
        },
      },
    },
    '/api/v1/auth/admin/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login as admin',
        requestBody: jsonRequest(ref('LoginRequest')),
        responses: {
          200: jsonResponse('Login successful', ref('AuthSuccess')),
          401: jsonResponse('Invalid credentials', ref('ApiError')),
        },
      },
    },
    '/api/v1/auth/verify-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Verify OTP',
        requestBody: jsonRequest(ref('VerifyOtpRequest')),
        responses: {
          200: jsonResponse('OTP verified successfully', ref('AuthSuccess')),
          400: jsonResponse('Invalid or expired OTP', ref('ApiError')),
        },
      },
    },
    '/api/v1/auth/resend-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Resend OTP',
        requestBody: jsonRequest(ref('EmailOnlyRequest')),
        responses: {
          200: jsonResponse('OTP resent successfully'),
        },
      },
    },
    '/api/v1/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Send password reset OTP',
        requestBody: jsonRequest(ref('EmailOnlyRequest')),
        responses: {
          200: jsonResponse('Password reset OTP sent'),
        },
      },
    },
    '/api/v1/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password',
        requestBody: jsonRequest(ref('ResetPasswordRequest')),
        responses: {
          200: jsonResponse('Password reset successful'),
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current account',
        security: bearer,
        responses: {
          200: jsonResponse('Current account fetched'),
          401: jsonResponse('Authentication required', ref('ApiError')),
        },
      },
    },
    '/api/v1/auth/profile': {
      patch: {
        tags: ['Auth'],
        summary: 'Update profile',
        security: bearer,
        requestBody: jsonRequest(ref('ProfileUpdateRequest')),
        responses: {
          200: jsonResponse('Profile updated successfully'),
        },
      },
    },
    '/api/v1/properties': {
      get: {
        tags: ['Properties'],
        summary: 'List properties',
        responses: {
          200: jsonResponse('Properties fetched successfully'),
        },
      },
      post: {
        tags: ['Properties'],
        summary: 'Create property',
        security: bearer,
        requestBody: jsonRequest(ref('PropertyRequest')),
        responses: {
          201: jsonResponse('Property created successfully'),
          403: jsonResponse('Admin role required', ref('ApiError')),
        },
      },
    },
    '/api/v1/properties/{id}': {
      get: {
        tags: ['Properties'],
        summary: 'Get property by id',
        parameters: [idParam('id', 'Property id')],
        responses: {
          200: jsonResponse('Property fetched successfully'),
          404: jsonResponse('Property not found', ref('ApiError')),
        },
      },
      patch: {
        tags: ['Properties'],
        summary: 'Update property',
        security: bearer,
        parameters: [idParam('id', 'Property id')],
        requestBody: jsonRequest(ref('PropertyRequest')),
        responses: {
          200: jsonResponse('Property updated successfully'),
        },
      },
      delete: {
        tags: ['Properties'],
        summary: 'Delete property',
        security: bearer,
        parameters: [idParam('id', 'Property id')],
        responses: {
          200: jsonResponse('Property deleted successfully'),
        },
      },
    },
    '/api/v1/applications': {
      post: {
        tags: ['Applications'],
        summary: 'Create rental application',
        security: bearer,
        requestBody: jsonRequest(ref('ApplicationCreateRequest')),
        responses: {
          201: jsonResponse('Application submitted successfully'),
        },
      },
      get: {
        tags: ['Applications'],
        summary: 'List applications for admins',
        security: bearer,
        responses: {
          200: jsonResponse('Applications fetched successfully'),
        },
      },
    },
    '/api/v1/applications/mine': {
      get: {
        tags: ['Applications'],
        summary: 'List current user applications',
        security: bearer,
        responses: {
          200: jsonResponse('Applications fetched successfully'),
        },
      },
    },
    '/api/v1/applications/{id}': {
      get: {
        tags: ['Applications'],
        summary: 'Get application by id',
        security: bearer,
        parameters: [idParam('id', 'Application id')],
        responses: {
          200: jsonResponse('Application fetched successfully'),
        },
      },
    },
    '/api/v1/applications/{id}/status': {
      patch: {
        tags: ['Applications'],
        summary: 'Update application status',
        security: bearer,
        parameters: [idParam('id', 'Application id')],
        requestBody: jsonRequest(ref('StatusRequest')),
        responses: {
          200: jsonResponse('Application status updated successfully'),
        },
      },
    },
    '/api/v1/payments/checkout-session': {
      post: {
        tags: ['Payments'],
        summary: 'Create checkout session',
        security: bearer,
        requestBody: jsonRequest(ref('CheckoutSessionRequest')),
        responses: {
          200: jsonResponse('Checkout session created'),
        },
      },
    },
    '/api/v1/payments/verify-session/{sessionId}': {
      get: {
        tags: ['Payments'],
        summary: 'Verify checkout session',
        security: bearer,
        parameters: [idParam('sessionId', 'Stripe session id')],
        responses: {
          200: jsonResponse('Payment verified successfully'),
        },
      },
    },
    '/api/v1/payments/mine': {
      get: {
        tags: ['Payments'],
        summary: 'List my payments',
        security: bearer,
        responses: {
          200: jsonResponse('Payments fetched successfully'),
        },
      },
    },
    '/api/v1/payments': {
      get: {
        tags: ['Payments'],
        summary: 'List all payments for admins',
        security: bearer,
        responses: {
          200: jsonResponse('Payments fetched successfully'),
        },
      },
    },
    '/api/v1/payments/receipt/{id}': {
      get: {
        tags: ['Payments'],
        summary: 'Get payment receipt URL',
        security: bearer,
        parameters: [idParam('id', 'Payment id')],
        responses: {
          200: jsonResponse('Receipt fetched successfully'),
          404: jsonResponse('Receipt not found', ref('ApiError')),
        },
      },
    },
    '/api/v1/messages/threads': {
      get: {
        tags: ['Messages'],
        summary: 'List message threads',
        security: bearer,
        responses: {
          200: jsonResponse('Threads fetched successfully'),
        },
      },
    },
    '/api/v1/messages/thread/{participantId}': {
      get: {
        tags: ['Messages'],
        summary: 'Get a message thread',
        security: bearer,
        parameters: [idParam('participantId', 'Thread participant id')],
        responses: {
          200: jsonResponse('Thread fetched successfully'),
        },
      },
    },
    '/api/v1/messages': {
      post: {
        tags: ['Messages'],
        summary: 'Send a message',
        security: bearer,
        requestBody: jsonRequest(ref('MessageRequest')),
        responses: {
          201: jsonResponse('Message sent successfully'),
        },
      },
    },
    '/api/v1/complaints': {
      post: {
        tags: ['Complaints'],
        summary: 'Create complaint',
        security: bearer,
        requestBody: jsonRequest(ref('ComplaintRequest')),
        responses: {
          201: jsonResponse('Complaint submitted successfully'),
        },
      },
      get: {
        tags: ['Complaints'],
        summary: 'List complaints',
        security: bearer,
        responses: {
          200: jsonResponse('Complaints fetched successfully'),
        },
      },
    },
    '/api/v1/complaints/{id}': {
      patch: {
        tags: ['Complaints'],
        summary: 'Update complaint',
        security: bearer,
        parameters: [idParam('id', 'Complaint id')],
        requestBody: jsonRequest(ref('StatusRequest')),
        responses: {
          200: jsonResponse('Complaint updated successfully'),
        },
      },
    },
    '/api/v1/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications',
        security: bearer,
        responses: {
          200: jsonResponse('Notifications fetched successfully'),
        },
      },
    },
    '/api/v1/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark notification as read',
        security: bearer,
        parameters: [idParam('id', 'Notification id')],
        responses: {
          200: jsonResponse('Notification marked as read'),
        },
      },
    },
    '/api/v1/notifications/announcement': {
      post: {
        tags: ['Notifications'],
        summary: 'Send announcement',
        security: bearer,
        requestBody: jsonRequest(ref('AnnouncementRequest')),
        responses: {
          201: jsonResponse('Announcement sent successfully'),
        },
      },
    },
    '/api/v1/agreements': {
      get: {
        tags: ['Agreements'],
        summary: 'List agreements',
        security: bearer,
        responses: {
          200: jsonResponse('Agreements fetched successfully'),
        },
      },
      post: {
        tags: ['Agreements'],
        summary: 'Create agreement',
        security: bearer,
        requestBody: multipartRequest(ref('AgreementRequest')),
        responses: {
          201: jsonResponse('Agreement uploaded successfully'),
        },
      },
    },
    '/api/v1/agreements/{id}': {
      get: {
        tags: ['Agreements'],
        summary: 'Get agreement by id',
        security: bearer,
        parameters: [idParam('id', 'Agreement id')],
        responses: {
          200: jsonResponse('Agreement fetched successfully'),
          404: jsonResponse('Agreement not found', ref('ApiError')),
        },
      },
    },
    '/api/v1/uploads/documents': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload documents',
        security: bearer,
        requestBody: multipartRequest(ref('DocumentUploadRequest')),
        responses: {
          201: jsonResponse('Documents uploaded successfully'),
        },
      },
    },
    '/api/v1/uploads/property-images': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload property images',
        security: bearer,
        requestBody: multipartRequest(ref('PropertyImagesUploadRequest')),
        responses: {
          201: jsonResponse('Images uploaded successfully'),
        },
      },
    },
    '/api/v1/uploads/documents/{id}/status': {
      patch: {
        tags: ['Uploads'],
        summary: 'Update document status',
        security: bearer,
        parameters: [idParam('id', 'Document id')],
        requestBody: jsonRequest(ref('StatusRequest')),
        responses: {
          200: jsonResponse('Document status updated successfully'),
        },
      },
    },
    '/api/v1/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Get dashboard',
        security: bearer,
        responses: {
          200: jsonResponse('Dashboard fetched successfully'),
        },
      },
    },
    '/api/v1/admin/properties': {
      get: {
        tags: ['Admin'],
        summary: 'Get managed properties',
        security: bearer,
        responses: {
          200: jsonResponse('Managed properties fetched successfully'),
        },
      },
    },
    '/api/v1/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List users',
        security: bearer,
        responses: {
          200: jsonResponse('Users fetched successfully'),
        },
      },
      post: {
        tags: ['Admin'],
        summary: 'Create user as admin',
        security: bearer,
        requestBody: jsonRequest(ref('UserSignupRequest')),
        responses: {
          201: jsonResponse('User created successfully'),
        },
      },
    },
    '/api/v1/admin/users/{id}/status': {
      patch: {
        tags: ['Admin'],
        summary: 'Update user status',
        security: bearer,
        parameters: [idParam('id', 'User id')],
        requestBody: jsonRequest(ref('StatusRequest')),
        responses: {
          200: jsonResponse('User status updated successfully'),
        },
      },
    },
    '/api/v1/admin/reports/payments': {
      get: {
        tags: ['Admin'],
        summary: 'Get payment report',
        security: bearer,
        responses: {
          200: jsonResponse('Payment report fetched successfully'),
        },
      },
    },
    '/api/v1/admin/admins': {
      post: {
        tags: ['Admin'],
        summary: 'Create admin',
        security: bearer,
        requestBody: jsonRequest(ref('AdminCreateRequest')),
        responses: {
          201: jsonResponse('Admin created successfully'),
        },
      },
    },
  },
};

module.exports = swaggerSpec;
