const { getPool } = require('../config/database');

class Booking {
  static async create(bookingData) {
    const pool = getPool();
    const { event_id, user_id, quantity, total_amount, status = 'confirmed' } = bookingData;
    
    const [result] = await pool.execute(
      'INSERT INTO bookings (event_id, user_id, quantity, total_amount, booking_date, status) VALUES (?, ?, ?, ?, NOW(), ?)',
      [event_id, user_id, quantity, total_amount, status]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const pool = getPool();
    const [bookings] = await pool.execute(`
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
    `, [id]);

    return bookings[0] || null;
  }

  static async findByUser(userId, filters = {}) {
    const pool = getPool();
    const { event_id, status, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.*,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location,
        e.img as event_image
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.user_id = ?
    `;
    
    const params = [userId];

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
    return bookings;
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    const { event_id, status, page = 1, limit = 10 } = filters;
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
    return bookings;
  }

  static async updateStatus(id, status) {
    const pool = getPool();
    await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );

    return this.findById(id);
  }

  static async getBookingStats() {
    const pool = getPool();
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN total_amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'confirmed' THEN quantity ELSE 0 END) as total_tickets_sold
      FROM bookings
    `);
    
    return stats[0];
  }

  static async getRevenueByEvent() {
    const pool = getPool();
    const [revenue] = await pool.execute(`
      SELECT 
        e.id,
        e.title,
        SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END) as revenue,
        SUM(CASE WHEN b.status = 'confirmed' THEN b.quantity ELSE 0 END) as tickets_sold
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id
      GROUP BY e.id, e.title
      ORDER BY revenue DESC
    `);
    
    return revenue;
  }
}

module.exports = Booking;
