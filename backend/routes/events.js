const express = require('express');
const { body } = require('express-validator');
const { 
  getEvents, 
  getEvent, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} = require('../controllers/eventController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all events (public)
router.get('/', getEvents);

// Get single event (public)
router.get('/:id', getEvent);

// Create event (admin only)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('location').notEmpty().withMessage('Location is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('total_seats').isInt({ min: 1 }).withMessage('Total seats must be a positive integer'),
  body('img').optional().isURL().withMessage('Image must be a valid URL')
], createEvent);

// Update event (admin only)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('date').optional().isISO8601().withMessage('Please provide a valid date'),
  body('location').optional().notEmpty().withMessage('Location cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('total_seats').optional().isInt({ min: 1 }).withMessage('Total seats must be a positive integer'),
  body('img').optional().isURL().withMessage('Image must be a valid URL')
], updateEvent);

// Delete event (admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteEvent);

module.exports = router;
