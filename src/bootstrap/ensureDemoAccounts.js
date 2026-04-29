const Admin = require('../models/Admin');
const User = require('../models/User');
const { USER_STATUS } = require('../constants/appConstants');

const DEMO_ADMIN = {
  name: 'Demo Admin',
  phone: '9999999999',
  email: 'admin@example.com',
  password: 'Admin@123',
};

const DEMO_USER = {
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
};

const syncDemoAdmin = async () => {
  let admin = await Admin.findOne({
    $or: [{ phone: DEMO_ADMIN.phone }, { email: DEMO_ADMIN.email }],
  }).select('+password');

  if (!admin) {
    await Admin.create(DEMO_ADMIN);
    console.log(`Demo admin ready: ${DEMO_ADMIN.phone} / ${DEMO_ADMIN.password}`);
    return;
  }

  admin.name = DEMO_ADMIN.name;
  admin.phone = DEMO_ADMIN.phone;
  admin.email = DEMO_ADMIN.email;
  admin.password = DEMO_ADMIN.password;
  await admin.save();
};

const syncDemoUser = async () => {
  let user = await User.findOne({
    $or: [{ phone: DEMO_USER.phone }, { email: DEMO_USER.email }],
  }).select('+password');

  if (!user) {
    await User.create(DEMO_USER);
    console.log(`Demo user ready: ${DEMO_USER.phone} / ${DEMO_USER.password}`);
    return;
  }

  user.fullName = DEMO_USER.fullName;
  user.email = DEMO_USER.email;
  user.phone = DEMO_USER.phone;
  user.alternatePhone = DEMO_USER.alternatePhone;
  user.password = DEMO_USER.password;
  user.address = DEMO_USER.address;
  user.aadhaarNumber = DEMO_USER.aadhaarNumber;
  user.occupation = DEMO_USER.occupation;
  user.income = DEMO_USER.income;
  user.isEmailVerified = DEMO_USER.isEmailVerified;
  user.status = DEMO_USER.status;
  await user.save();
};

const ensureDemoAccounts = async ({ enabled, nodeEnv }) => {
  if (!enabled || nodeEnv === 'production') {
    return;
  }

  await syncDemoAdmin();
  await syncDemoUser();
};

module.exports = ensureDemoAccounts;
