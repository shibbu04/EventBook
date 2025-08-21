-- Smart Event Booking System Database Schema
-- MySQL Database Setup

-- Create database
CREATE DATABASE IF NOT EXISTS event_booking;
USE event_booking;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Events table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    total_seats INT NOT NULL DEFAULT 0,
    available_seats INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    img VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date (date),
    INDEX idx_location (location),
    INDEX idx_title (title)
);

-- Bookings table (updated to reference users)
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled', 'pending') DEFAULT 'confirmed',
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_event_id (event_id),
    INDEX idx_booking_date (booking_date)
);

-- Insert sample events data with Indian Rupee prices
INSERT INTO events (title, description, location, date, total_seats, available_seats, price, img) VALUES
(
    'Code. Connect. Create. One Epic Conference',
    'Summitra 2025 is an immersive, IT Conference over the course of three days, August 13-15. Join top IT minds and industry leaders for keynotes, workshops, and networking.',
    'Mumbai, Maharashtra',
    '2025-08-13 09:00:00',
    500,
    500,
    2999.00,
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop'
),
(
    'AI & Machine Learning Summit',
    'Explore the future of artificial intelligence and machine learning. Learn from experts about the latest trends, tools, and technologies shaping the AI landscape.',
    'Bangalore, Karnataka',
    '2025-09-15 10:00:00',
    300,
    300,
    4999.00,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'
),
(
    'Cloud Computing & DevOps Conference',
    'Deep dive into cloud technologies, DevOps practices, and infrastructure automation. Perfect for developers and system administrators.',
    'Hyderabad, Telangana',
    '2025-10-20 09:30:00',
    400,
    400,
    3999.00,
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop'
),
(
    'Blockchain & Web3 Expo',
    'Discover the latest in blockchain technology, cryptocurrencies, and Web3 development. Network with crypto enthusiasts and blockchain developers.',
    'Pune, Maharashtra',
    '2025-11-08 08:00:00',
    250,
    250,
    3499.00,
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop'
),
(
    'Cybersecurity & Privacy Summit',
    'Learn about the latest cybersecurity threats, privacy regulations, and protection strategies. Essential for security professionals.',
    'Delhi, NCR',
    '2025-12-03 09:00:00',
    350,
    350,
    5999.00,
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop'
),
(
    'Mobile App Development Workshop',
    'Hands-on workshop covering iOS and Android development, React Native, and Flutter. Build real apps during the session.',
    'Chennai, Tamil Nadu',
    '2025-09-25 10:00:00',
    150,
    150,
    7999.00,
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'
);

-- Create indexes for better performance
CREATE INDEX idx_events_date_location ON events(date, location);
CREATE INDEX idx_bookings_event_user ON bookings(event_id, user_id);

-- Views for analytics (optional)
CREATE VIEW event_statistics AS
SELECT 
    e.id,
    e.title,
    e.total_seats,
    e.available_seats,
    (e.total_seats - e.available_seats) as booked_seats,
    COALESCE(SUM(b.total_amount), 0) as total_revenue,
    COUNT(b.id) as total_bookings
FROM events e
LEFT JOIN bookings b ON e.id = b.event_id AND b.status = 'confirmed'
GROUP BY e.id;

-- Show tables and their structure
SHOW TABLES;
DESCRIBE users;
DESCRIBE events;
DESCRIBE bookings;

-- NOTE: To create admin and test users, run the createAdmin script:
-- cd backend && node scripts/createAdmin.js