# 🎟️ Smart Event Booking System

A modern, full-stack event booking platform built with React.js, Node.js, Express, and MySQL. Features real-time seat availability, beautiful animations, dark mode, and PWA support.

## ✨ Features

### 🎨 Frontend Features
- **Beautiful Landing Page** - Inspired by modern conference websites with smooth animations
- **Dark/Light Theme Toggle** - Seamless theme switching with system preference detection
- **Responsive Design** - Fully responsive across all devices
- **Real-time Updates** - Live seat availability using WebSockets
- **Event Discovery** - Advanced search and filtering by location and date
- **Smooth Animations** - Powered by Framer Motion for delightful user experience
- **Interactive Booking Flow** - Step-by-step booking process with form validation
- **Success Screen** - Confetti animation with downloadable QR code tickets
- **PWA Support** - Install as a native app on mobile devices

### 🔧 Backend Features
- **RESTful APIs** - Complete CRUD operations for events and bookings
- **Real-time Communication** - WebSocket integration for live updates
- **Seat Locking** - Temporary seat reservation during booking process
- **QR Code Generation** - Automatic ticket QR code creation
- **Database Integration** - MySQL with optimized queries and indexes
- **Error Handling** - Comprehensive error management and validation

### 👨‍💼 Admin Features
- **Dashboard Analytics** - Event statistics and revenue tracking
- **Event Management** - Create, read, update, and delete events
- **Real-time Monitoring** - Live booking notifications
- **Responsive Admin Panel** - Mobile-friendly administration interface

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Framer Motion** - Production-ready motion library for animations
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **React Hook Form** - Performant forms with easy validation
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Beautiful, customizable icons

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MySQL2** - MySQL client for Node.js
- **Socket.io** - Real-time bidirectional communication
- **QRCode** - QR code generation library
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Database
- **MySQL** - Reliable relational database
- **Optimized Schema** - Efficient table structure with proper indexing
- **Triggers** - Automatic seat count updates
- **Foreign Keys** - Data integrity constraints

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd event-management
```

### 2. Database Setup

#### Option A: Local MySQL
1. Install and start MySQL server
2. Create a database:
```sql
CREATE DATABASE event_booking;
```
3. Import the schema:
```bash
mysql -u root -p event_booking < event_booking.sql
```

#### Option B: PlanetScale (Recommended for Production)
1. Sign up for [PlanetScale](https://planetscale.com/)
2. Create a new database
3. Get your connection string
4. Import the schema using PlanetScale CLI or MySQL client

### 3. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=event_booking
# DB_PORT=3306
# FRONTEND_URL=http://localhost:3000

# Start the server
npm run dev
```

The backend will start on `http://localhost:5000`

### 4. Frontend Setup
```bash
cd frontend
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

## 📱 PWA Installation

The application supports Progressive Web App (PWA) features:

1. Open the website in Chrome/Edge
2. Click the install button in the address bar
3. Or use "Add to Home Screen" from the browser menu

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_booking
DB_PORT=3306

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Frontend
Create `.env` in the frontend directory:
```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

## 📊 Database Schema

### Events Table
```sql
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled', 'pending') DEFAULT 'confirmed',
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
```

## 🌐 API Endpoints

### Events
- `GET /api/events` - Get all events (with optional filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get bookings (with optional filters)

### Query Parameters
- `search` - Search in title and description
- `location` - Filter by location
- `date` - Filter by specific date (YYYY-MM-DD)
- `limit` - Limit number of results
- `offset` - Pagination offset

## 🎯 Key Features Explained

### Real-time Seat Locking
When a user starts the booking process, seats are temporarily locked for 10 minutes using WebSockets. This prevents overselling and provides a smooth booking experience.

### QR Code Tickets
After successful booking, users receive a QR code containing:
- Booking ID
- Event details
- Customer information
- Verification data

### Dark Mode
The application automatically detects system theme preference and allows manual toggling. Theme choice is persisted in localStorage.

### Responsive Design
The interface adapts to all screen sizes:
- Mobile-first approach
- Touch-friendly interactions
- Optimized layouts for tablets and desktops

## 🚀 Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Backend (Render)
1. Push your backend code to GitHub
2. Create a new Web Service on Render
3. Connect your repo
4. Set environment variables
5. Deploy

### Database (PlanetScale)
1. Create a database on PlanetScale
2. Import your schema
3. Update connection string in your backend

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Environment variable protection
- Secure booking process

## 🎨 Customization

### Theme Colors
Modify `tailwind.config.js` to change the color scheme:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your primary color palette
      }
    }
  }
}
```

### Adding New Features
The codebase is modular and extensible:
- Add new API endpoints in `/backend/server.js`
- Create new React components in `/frontend/src/components`
- Add new pages in `/frontend/src/pages`

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Summitra Conference Website](https://summitra-flowz.webflow.io/) - Design inspiration
- [Unsplash](https://unsplash.com/) - Stock images
- [Lucide](https://lucide.dev/) - Beautiful icons
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@eventbook.com

---

Made with ❤️ for amazing events
