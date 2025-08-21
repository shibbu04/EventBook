const express = require('express');
const { body } = require('express-validator');
const { 
  createBooking, 
  getBookings, 
  getBooking, 
  cancelBooking,
  getAnalytics 
} = require('../controllers/bookingController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All booking routes require authentication
router.use(authenticateToken);

// Get bookings (users see their own, admins see all)
router.get('/', getBookings);

// Get booking analytics (admin only)
router.get('/analytics', requireAdmin, getAnalytics);

// Get single booking
router.get('/:id', getBooking);

// Create booking
router.post('/', [
  body('event_id').isInt({ min: 1 }).withMessage('Event ID is required'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10')
], createBooking);

// Cancel booking
router.put('/:id/cancel', cancelBooking);

module.exports = router;
