const { validationResult } = require('express-validator');
const { getPool } = require('../config/database');
const QRCode = require('qrcode');
const { formatIndianCurrency } = require('../utils/helpers');

// Get all events with search and filter
const getEvents = async (req, res) => {
  try {
    const { search, location, date, limit = 10, offset = 0 } = req.query;
    const pool = getPool();
    
    // Convert limit and offset to integers and validate
    const limitInt = Math.max(1, Math.min(parseInt(limit) || 10, 100)); // Max 100
    const offsetInt = Math.max(0, parseInt(offset) || 0);
    
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (location && location.trim()) {
      query += ' AND location LIKE ?';
      params.push(`%${location.trim()}%`);
    }

    if (date && date.trim()) {
      query += ' AND DATE(date) = ?';
      params.push(date.trim());
    }

    // Use string concatenation for LIMIT/OFFSET to avoid MySQL parameter binding issues
    query += ` ORDER BY date ASC LIMIT ${limitInt} OFFSET ${offsetInt}`;

    const [events] = await pool.execute(query, params);
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get single event
const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    const [events] = await pool.execute('SELECT * FROM events WHERE id = ?', [id]);
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = events[0];
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// Create new event (Admin only)
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, location, date, total_seats, price, img } = req.body;
    const pool = getPool();
    
    const [result] = await pool.execute(
      'INSERT INTO events (title, description, location, date, total_seats, available_seats, price, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, location, date, total_seats, total_seats, price, img]
    );

    const [newEvent] = await pool.execute('SELECT * FROM events WHERE id = ?', [result.insertId]);
    const event = newEvent[0];
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// Update event (Admin only)
const updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, location, date, total_seats, price, img } = req.body;
    const pool = getPool();
    
    // Check if event exists
    const [existingEvents] = await pool.execute('SELECT * FROM events WHERE id = ?', [id]);
    if (existingEvents.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const existingEvent = existingEvents[0];
    const bookedSeats = existingEvent.total_seats - existingEvent.available_seats;
    const newAvailableSeats = total_seats - bookedSeats;

    if (newAvailableSeats < 0) {
      return res.status(400).json({ 
        error: `Cannot reduce total seats below ${bookedSeats} (already booked seats)` 
      });
    }

    await pool.execute(
      'UPDATE events SET title = ?, description = ?, location = ?, date = ?, total_seats = ?, available_seats = ?, price = ?, img = ? WHERE id = ?',
      [title, description, location, date, total_seats, newAvailableSeats, price, img, id]
    );

    const [updatedEvent] = await pool.execute('SELECT * FROM events WHERE id = ?', [id]);
    const event = updatedEvent[0];
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// Delete event (Admin only)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    // Check if event has bookings
    const [bookings] = await pool.execute('SELECT COUNT(*) as count FROM bookings WHERE event_id = ?', [id]);
    if (bookings[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete event with existing bookings' 
      });
    }

    const [result] = await pool.execute('DELETE FROM events WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Get admin analytics
const getAnalytics = async (req, res) => {
  try {
    const pool = getPool();

    // Get basic statistics
    const [eventStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_events,
        SUM(total_seats) as total_capacity,
        SUM(total_seats - available_seats) as total_booked,
        AVG(price) as avg_price
      FROM events
    `);

    const [userStats] = await pool.execute('SELECT COUNT(*) as total_users FROM users WHERE role = "user"');
    
    const [bookingStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_booking_value
      FROM bookings
    `);

    // Get monthly revenue
    const [monthlyRevenue] = await pool.execute(`
      SELECT 
        DATE_FORMAT(booking_date, '%Y-%m') as month,
        SUM(total_amount) as revenue,
        COUNT(*) as bookings
      FROM bookings
      WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
      ORDER BY month ASC
    `);

    // Get top events
    const [topEvents] = await pool.execute(`
      SELECT 
        e.id,
        e.title,
        e.location,
        e.date,
        COUNT(b.id) as booking_count,
        SUM(b.total_amount) as revenue,
        (e.total_seats - e.available_seats) as seats_sold
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id
      GROUP BY e.id
      ORDER BY booking_count DESC, revenue DESC
      LIMIT 10
    `);

    // Format currency values
    const analytics = {
      events: {
        total: eventStats[0].total_events,
        total_capacity: eventStats[0].total_capacity,
        total_booked: eventStats[0].total_booked,
        occupancy_rate: eventStats[0].total_capacity > 0 
          ? Math.round((eventStats[0].total_booked / eventStats[0].total_capacity) * 100) 
          : 0,
        avg_price: formatIndianCurrency(eventStats[0].avg_price || 0)
      },
      users: {
        total: userStats[0].total_users
      },
      bookings: {
        total: bookingStats[0].total_bookings,
        total_revenue: formatIndianCurrency(bookingStats[0].total_revenue || 0),
        avg_booking_value: formatIndianCurrency(bookingStats[0].avg_booking_value || 0)
      },
      monthly_revenue: monthlyRevenue.map(month => ({
        ...month,
        revenue_formatted: formatIndianCurrency(month.revenue)
      })),
      top_events: topEvents.map(event => ({
        ...event,
        revenue_formatted: formatIndianCurrency(event.revenue || 0)
      }))
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getAnalytics
};
