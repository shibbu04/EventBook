# 🎟️ Smart Event Booking System

A modern, full-stack MERN (MySQL) event booking platform with real-time seat availability, QR tickets, animations, and PWA support.

🔗 **Live Link**: [https://event-booking-app.vercel.app](https://event-booking-app.vercel.app)

---

## 🏗 Tech Stack

* **Frontend**: React.js, Tailwind CSS, Framer Motion, React Router, Socket.io-client
* **Backend**: Node.js, Express.js, Socket.io, MySQL2
* **Database**: MySQL (AlwaysData)
* **Deployment**:

  * Frontend → Vercel
  * Backend → Render
  * Database → AlwaysData

---

## 📂 Project Structure

```
event-booking/
│── frontend/                      # React app
│── backend/                       # Node.js + Express + APIs
│── event_booking.sql/             # SQL schema & seed files
│── Documentation(ReadMe)          # Documenation
```

---

## 🚀 Clone & Setup

### 1. Clone Repo

```bash
git clone https://github.com/shibbu04/EventBook.git
cd EventBook
```

### 2. Database (AlwaysData or Local MySQL)

```sql
-- If local MySQL
CREATE DATABASE event_booking;
-- Import schema
mysql -u root -p event_booking < database/event_booking.sql

AND

-- Open Terminal ( Run this Script to create temporary admin and users to login)

  ```bash
  cd backend
  npm install 
  node scripts/createAdmin.js
  ```

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # update DB + frontend URL
npm run dev
```

Runs on → `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on → `http://localhost:3000`

---

## ✨ Features

* Landing page with animations + dark/light mode
* Event search & filters
* Real-time seat availability (WebSockets)
* Interactive booking flow + QR code tickets
* Admin dashboard (CRUD events, revenue stats)
* PWA support

---

## 🌐 API Endpoints

### Events

* `GET /api/events` → list events
* `GET /api/events/:id` → single event
* `POST /api/events` → create event (admin)
* `PUT /api/events/:id` → update event (admin)
* `DELETE /api/events/:id` → delete event (admin)

### Bookings

* `POST /api/bookings` → create booking
* `GET /api/bookings` → list bookings

---

## 📝 Remaining Work

* Payment gateway integration
* Email notifications
* Multi-language support

---

## 👨‍💻 Developer

**Name:** Shivam Singh

**Role:** Full Stack Developer

**Email:** [shivamsingh57680@gmail.com](mailto:shivamsingh57680@gmail.com)

**GitHub:** [@shibbu04](https://github.com/shibbu04)

**Portfolio:** [Shivam Singh](https://shivam04.vercel.app/)
