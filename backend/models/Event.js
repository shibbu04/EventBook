const { getPool } = require('../config/database');

class Event {
  static async findAll(filters = {}) {
    const pool = getPool();
    const { search, location, date, limit = 10, offset = 0 } = filters;
    
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    if (date) {
      query += ' AND DATE(date) = ?';
      params.push(date);
    }

    query += ' ORDER BY date ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [events] = await pool.execute(query, params);
    return events;
  }

  static async findById(id) {
    const pool = getPool();
    const [events] = await pool.execute(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );
    return events[0] || null;
  }

  static async create(eventData) {
    const pool = getPool();
    const { title, description, location, date, total_seats, price, img } = eventData;
    
    const [result] = await pool.execute(
      'INSERT INTO events (title, description, location, date, total_seats, available_seats, price, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, location, date, total_seats, total_seats, price, img]
    );

    return this.findById(result.insertId);
  }

  static async update(id, eventData) {
    const pool = getPool();
    const { title, description, location, date, total_seats, price, img } = eventData;
    
    await pool.execute(
      'UPDATE events SET title = ?, description = ?, location = ?, date = ?, total_seats = ?, price = ?, img = ? WHERE id = ?',
      [title, description, location, date, total_seats, price, img, id]
    );

    return this.findById(id);
  }

  static async delete(id) {
    const pool = getPool();
    await pool.execute('DELETE FROM events WHERE id = ?', [id]);
    return true;
  }

  static async updateSeats(id, quantity, operation = 'decrease') {
    const pool = getPool();
    const operator = operation === 'decrease' ? '-' : '+';
    
    await pool.execute(
      `UPDATE events SET available_seats = available_seats ${operator} ? WHERE id = ?`,
      [quantity, id]
    );
  }

  static async getEventStats() {
    const pool = getPool();
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN date > NOW() THEN 1 END) as upcoming_events,
        COUNT(CASE WHEN date <= NOW() THEN 1 END) as past_events,
        SUM(total_seats) as total_seats,
        SUM(available_seats) as available_seats
      FROM events
    `);
    
    return stats[0];
  }
}

module.exports = Event;
