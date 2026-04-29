const connectDatabase = require('./config/db');
const Admin = require('./models/Admin');
const Agreement = require('./models/Agreement');
const Complaint = require('./models/Complaint');
const Document = require('./models/Document');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const Payment = require('./models/Payment');
const Property = require('./models/Property');
const RentalApplication = require('./models/RentalApplication');
const User = require('./models/User');
const { APPLICATION_STATUS, PAYMENT_STATUS, PROPERTY_STATUS, USER_STATUS } = require('./constants/appConstants');

const seed = async () => {
  await connectDatabase();

  await Promise.all([
    Admin.deleteMany({}),
    Agreement.deleteMany({}),
    Complaint.deleteMany({}),
    Document.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
    Payment.deleteMany({}),
    Property.deleteMany({}),
    RentalApplication.deleteMany({}),
    User.deleteMany({}),
  ]);

  const admin = await Admin.create({
    name: 'Demo Admin',
    phone: '9999999999',
    email: 'admin@example.com',
    password: 'Admin@123',
  });

  const user = await User.create({
    fullName: 'Demo User',
    email: 'user@example.com',
    phone: '9876543210',
    alternatePhone: '9876500000',
    password: 'User@123',
    address: {
      current: 'Sector 12, Indore',
      permanent: 'Bhopal, Madhya Pradesh',
    },
    aadhaarNumber: '234567890123',
    occupation: 'Software Engineer',
    income: 65000,
    isEmailVerified: true,
    status: USER_STATUS.ACTIVE,
  });

  const properties = await Property.insertMany([
    {
      title: 'Premium Garden House',
      type: 'house',
      category: 'rent',
      address: {
        line1: '24 Palm Avenue',
        city: 'Indore',
        area: 'Vijay Nagar',
        state: 'Madhya Pradesh',
        pincode: '452010',
      },
      rent: 28000,
      deposit: 56000,
      description: 'A bright 3BHK family home with modular kitchen, balcony, parking and gated access.',
      images: [
        { url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80' },
      ],
      amenities: ['Parking', 'Gated community', 'Modular kitchen', 'Power backup'],
      status: PROPERTY_STATUS.AVAILABLE,
      createdBy: admin._id,
      floorSize: '1450 sq ft',
      bedrooms: 3,
      bathrooms: 2,
      availableFrom: new Date(),
      ownerContactPhone: '9999999999',
      ownerContactEmail: admin.email,
      featured: true,
    },
    {
      title: 'Main Road Retail Shop',
      type: 'shop',
      category: 'rent',
      address: {
        line1: '18 Market Street',
        city: 'Indore',
        area: 'Palasia',
        state: 'Madhya Pradesh',
        pincode: '452001',
      },
      rent: 42000,
      deposit: 84000,
      description: 'Road-facing commercial shop ideal for boutique, electronics or cafe concept.',
      images: [
        { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80' },
      ],
      amenities: ['Front signage', 'Washroom', 'Storage space', 'Customer parking'],
      status: PROPERTY_STATUS.OCCUPIED,
      createdBy: admin._id,
      shopSize: '720 sq ft',
      businessSuitability: 'Boutique, Cafe, Convenience store',
      availableFrom: new Date(),
      ownerContactPhone: '9999999999',
      ownerContactEmail: admin.email,
      tenantId: user._id,
    },
  ]);

  const application = await RentalApplication.create({
    userId: user._id,
    propertyId: properties[0]._id,
    status: APPLICATION_STATUS.UNDER_REVIEW,
    personalDetails: {
      fullName: user.fullName,
      fatherName: 'Rajesh Kumar',
      mobileNumber: user.phone,
      alternateMobileNumber: user.alternatePhone,
      email: user.email,
      currentAddress: user.address.current,
      permanentAddress: user.address.permanent,
      aadhaarNumber: user.aadhaarNumber,
      occupation: user.occupation,
      monthlyIncome: user.income,
      familyMembersCount: 4,
      requiredRentalStartDate: new Date(),
    },
    remarks: 'Looking for immediate possession.',
  });

  await Payment.create({
    userId: user._id,
    propertyId: properties[1]._id,
    amount: properties[1].rent,
    month: 'April 2026',
    paidDate: new Date(),
    paymentMethod: 'stripe_checkout',
    transactionId: 'DEMO-TXN-202604',
    receiptUrl: '',
    receiptNumber: 'RNT-2026-DEMO01',
    status: PAYMENT_STATUS.PAID,
    currency: 'inr',
  });

  await Complaint.create({
    userId: user._id,
    propertyId: properties[1]._id,
    subject: 'Water seepage near shutter',
    description: 'There is minor seepage during heavy rain. Please schedule a maintenance visit.',
    status: 'open',
  });

  await Message.insertMany([
    {
      senderId: user._id,
      senderModel: 'User',
      receiverId: admin._id,
      receiverModel: 'Admin',
      propertyId: properties[0]._id,
      message: 'Hello, I wanted to know if the house is still open for site visit this weekend?',
    },
    {
      senderId: admin._id,
      senderModel: 'Admin',
      receiverId: user._id,
      receiverModel: 'User',
      propertyId: properties[0]._id,
      message: 'Yes, it is available. You can book a visit for Saturday afternoon.',
    },
  ]);

  await Notification.insertMany([
    {
      recipientId: user._id,
      recipientModel: 'User',
      title: 'Application update',
      body: 'Your application is under review.',
      type: 'application',
      data: { applicationId: String(application._id) },
    },
    {
      recipientId: admin._id,
      recipientModel: 'Admin',
      title: 'Portfolio summary ready',
      body: 'Your dashboard has been refreshed with this month’s numbers.',
      type: 'general',
      data: {},
    },
  ]);

  await Agreement.create({
    userId: user._id,
    propertyId: properties[1]._id,
    title: 'Retail Shop Agreement',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2027-03-31'),
    rent: properties[1].rent,
    agreementFileUrl: 'https://example.com/demo-agreement.pdf',
    status: 'active',
    uploadedBy: admin._id,
  });

  console.log('Seed completed');
  console.log('Admin: 9999999999 / Admin@123');
  console.log('User: 9876543210 / User@123');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
