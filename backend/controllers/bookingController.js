const { validationResult } = require('express-validator');
const { getPool } = require('../config/database');
const QRCode = require('qrcode');
const { formatIndianCurrency, generateBookingRef } = require('../utils/helpers');

// Create booking
const createBooking = async (req, res) => {
  const connection = await getPool().getConnection();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { event_id, quantity } = req.body;
    const user_id = req.user.id;

    await connection.beginTransaction();

    // Get event details with row lock
    const [events] = await connection.execute(
      'SELECT * FROM events WHERE id = ? FOR UPDATE',
      [event_id]
    );

    if (events.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = events[0];

    // Check availability
    if (event.available_seats < quantity) {
      await connection.rollback();
      return res.status(400).json({ 
        error: `Only ${event.available_seats} seats available. You requested ${quantity} seats.` 
      });
    }

    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      await connection.rollback();
      return res.status(400).json({ error: 'Cannot book tickets for past events' });
    }

    const total_amount = event.price * quantity;

    // Create booking
    const [bookingResult] = await connection.execute(
      'INSERT INTO bookings (event_id, user_id, quantity, total_amount, booking_date, status) VALUES (?, ?, ?, ?, NOW(), ?)',
      [event_id, user_id, quantity, total_amount, 'confirmed']
    );

    // Update available seats
    await connection.execute(
      'UPDATE events SET available_seats = available_seats - ? WHERE id = ?',
      [quantity, event_id]
    );

    await connection.commit();

    // Generate QR code
    const bookingId = bookingResult.insertId;
    const qrData = {
      bookingId,
      eventId: event.id,
      eventTitle: event.title,
      userId: user_id,
      userName: req.user.name,
      quantity,
      totalAmount: total_amount,
      eventDate: event.date,
      location: event.location,
      bookingDate: new Date().toISOString()
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    const booking = {
      id: bookingId,
      event_id,
      user_id,
      quantity,
      total_amount,
      total_amount_formatted: formatIndianCurrency(total_amount),
      status: 'confirmed',
      qrCode,
      event: {
        ...event,
        price_formatted: formatIndianCurrency(event.price)
      }
    };

    res.status(201).json(booking);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    connection.release();
  }
};

// Get bookings (Admin can see all, users see their own)
const getBookings = async (req, res) => {
  try {
    const { event_id, status, page = 1, limit = 10 } = req.query;
    const pool = getPool();
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.*,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location,
        e.img as event_image,
        u.name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];

    // If not admin, only show user's own bookings
    if (req.user.role !== 'admin') {
      query += ' AND b.user_id = ?';
      params.push(req.user.id);
    }

    if (event_id) {
      query += ' AND b.event_id = ?';
      params.push(event_id);
    }

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.booking_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [bookings] = await pool.execute(query, params);

    // Format currency
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      total_amount_formatted: formatIndianCurrency(booking.total_amount)
    }));

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      WHERE 1=1
    `;
    const countParams = [];

    if (req.user.role !== 'admin') {
      countQuery += ' AND b.user_id = ?';
      countParams.push(req.user.id);
    }

    if (event_id) {
      countQuery += ' AND b.event_id = ?';
      countParams.push(event_id);
    }

    if (status) {
      countQuery += ' AND b.status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      bookings: formattedBookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Get single booking
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    let query = `
      SELECT 
        b.*,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location,
        e.img as event_image,
        e.price as event_price,
        u.name as user_name,
        u.email as user_email,
        u.mobile as user_mobile
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `;

    const params = [id];

    // If not admin, only allow access to own bookings
    if (req.user.role !== 'admin') {
      query += ' AND b.user_id = ?';
      params.push(req.user.id);
    }

    const [bookings] = await pool.execute(query, params);

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookings[0];
    booking.total_amount_formatted = formatIndianCurrency(booking.total_amount);
    booking.event_price_formatted = formatIndianCurrency(booking.event_price);

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  const connection = await getPool().getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Get booking details
    let query = `
      SELECT b.*, e.date as event_date, e.title as event_title
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.id = ? AND b.status = 'confirmed'
    `;
    
    const params = [id];

    // If not admin, only allow canceling own bookings
    if (req.user.role !== 'admin') {
      query += ' AND b.user_id = ?';
      params.push(req.user.id);
    }

    const [bookings] = await connection.execute(query, params);

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Booking not found or already cancelled' });
    }

    const booking = bookings[0];

    // Check if event is more than 24 hours away
    const eventDate = new Date(booking.event_date);
    const now = new Date();
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);

    if (hoursUntilEvent < 24) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Cannot cancel booking less than 24 hours before the event' 
      });
    }

    // Update booking status
    await connection.execute(
      'UPDATE bookings SET status = "cancelled" WHERE id = ?',
      [id]
    );

    // Return seats to available pool
    await connection.execute(
      'UPDATE events SET available_seats = available_seats + ? WHERE id = ?',
      [booking.quantity, booking.event_id]
    );

    await connection.commit();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  } finally {
    connection.release();
  }
};

// Get booking analytics (admin only)
const getAnalytics = async (req, res) => {
  try {
    const pool = getPool();
    
    // Get overall stats
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT b.event_id) as events_with_bookings,
        SUM(b.quantity) as total_tickets_sold,
        SUM(b.total_amount) as total_revenue,
        AVG(b.total_amount) as avg_booking_value
      FROM bookings b 
      WHERE b.status = 'confirmed'
    `);

    // Get monthly revenue
    const [monthlyRevenue] = await pool.execute(`
      SELECT 
        DATE_FORMAT(booking_date, '%Y-%m') as month,
        SUM(total_amount) as revenue,
        COUNT(*) as bookings
      FROM bookings 
      WHERE status = 'confirmed' 
        AND booking_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
      ORDER BY month ASC
    `);

    // Get top events by revenue
    const [topEvents] = await pool.execute(`
      SELECT 
        e.title,
        e.id,
        SUM(b.total_amount) as revenue,
        SUM(b.quantity) as tickets_sold,
        COUNT(b.id) as booking_count
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id AND b.status = 'confirmed'
      GROUP BY e.id, e.title
      ORDER BY revenue DESC
      LIMIT 10
    `);

    // Get recent bookings
    const [recentBookings] = await pool.execute(`
      SELECT 
        b.*,
        e.title as event_title,
        u.name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'confirmed'
      ORDER BY b.booking_date DESC
      LIMIT 20
    `);

    res.json({
      stats: stats[0],
      monthlyRevenue,
      topEvents,
      recentBookings
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  getAnalytics
};
