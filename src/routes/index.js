const express = require('express');
const authRoutes = require('./authRoutes');
const propertyRoutes = require('./propertyRoutes');
const applicationRoutes = require('./applicationRoutes');
const uploadRoutes = require('./uploadRoutes');
const paymentRoutes = require('./paymentRoutes');
const messageRoutes = require('./messageRoutes');
const complaintRoutes = require('./complaintRoutes');
const notificationRoutes = require('./notificationRoutes');
const agreementRoutes = require('./agreementRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/applications', applicationRoutes);
router.use('/uploads', uploadRoutes);
router.use('/payments', paymentRoutes);
router.use('/messages', messageRoutes);
router.use('/complaints', complaintRoutes);
router.use('/notifications', notificationRoutes);
router.use('/agreements', agreementRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
