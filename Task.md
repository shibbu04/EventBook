# 📌 Smart Event Booking System (MERN + MySQL)

## 🎯 Objective

Build a **complete event booking application** where:

* Users can browse events, book tickets, and manage reservations.
* Admins can create/manage events and track bookings.

---

## 🔑 Key Features

### 👤 User Features

* Browse upcoming events (list view).
* Search & filter events (by **location** and **date**).
* View **real-time seat availability**.
* Book tickets with validation.
* Checkout flow with **smooth animations**.
* Success screen with:

  * 🎉 Confetti animation
  * 📄 Downloadable **QR code ticket**

### 🛠 Admin Features

* Create, update, delete events (CRUD).
* Manage and track bookings.

### ⚡ Advanced Features

* Real-time **seat locking** (WebSockets).
* Mobile-friendly **PWA**.
* Event details with **Google Maps integration**.
* Modern animations (**Framer Motion + Parallax**).

---

## 🗄 Database Design (MySQL)

### `events` Table

| Column           | Type     | Description       |
| ---------------- | -------- | ----------------- |
| id (PK)          | INT      | Event ID          |
| title            | VARCHAR  | Event title       |
| description      | TEXT     | Event description |
| location         | VARCHAR  | Event location    |
| date             | DATETIME | Event date        |
| total\_seats     | INT      | Total seats       |
| available\_seats | INT      | Available seats   |
| price            | DECIMAL  | Ticket price      |
| img              | VARCHAR  | Event image URL   |

### `bookings` Table

| Column         | Type     | Description           |
| -------------- | -------- | --------------------- |
| id (PK)        | INT      | Booking ID            |
| event\_id (FK) | INT      | Reference → events.id |
| name           | VARCHAR  | User name             |
| email          | VARCHAR  | User email            |
| mobile         | VARCHAR  | User mobile           |
| quantity       | INT      | Tickets booked        |
| total\_amount  | DECIMAL  | Price × quantity      |
| booking\_date  | DATETIME | Booking timestamp     |
| status         | ENUM     | confirmed / cancelled |

---

## 🔗 Backend (Node.js + Express + MySQL)

### APIs

#### Event APIs

* `POST /events` → Create event (Admin only)
* `GET /events` → List all events (with search + filter)
* `GET /events/:id` → Event details
* `PUT /events/:id` → Update event (Admin only)
* `DELETE /events/:id` → Delete event (Admin only)

#### Booking APIs

* `POST /bookings` → Book tickets

---

## 🎨 Frontend (React + Tailwind + Framer Motion)

### Pages & Features

1. **Landing Page**

   * Copy design from 👉 [https://summitra-flowz.webflow.io/](https://summitra-flowz.webflow.io/)
   * Add **Light/Dark mode toggle**
   * Fully responsive

2. **Event Listing Page**

   * Search + filter by location/date
   * Animated event cards
   * Real-time seat availability indicator

3. **Event Details Page**

   * Event description + location (Google Maps)
   * Ticket categories with pricing
   * Smooth animated ticket form

4. **Booking Flow**

   * Animated checkout form
   * Success screen with **confetti** + **QR code download**

5. **Admin Dashboard**

   * Event CRUD management

---

## ☁ Deployment

* **Frontend** → Vercel (Free Tier: 125 GB bandwidth/month, 100 deployments, 1 GB storage).
* **Backend** → Render (Free Tier: 750 hours/month, 512 MB RAM, sleeps after 15 min).
* **Database** → PlanetScale (Free MySQL serverless DB, production-ready).

---

## 📂 Project Structure

```
SmartEventBooking/
│
├── frontend/   # React + Tailwind + Framer Motion
│   └── ...
│
├── backend/    # Node.js + Express + MySQL
│   └── ...
│
├── event_booking.sql   # Database schema
├── README.md           # Setup & deployment instructions
└── TASK.md             # This file
```

---

## 📌 Deliverables

* Clean, minimal code (no unnecessary files).
* Separate **frontend** and **backend** folders.
* GitHub-ready structure.
* `README.md` with setup instructions.
* `event_booking.sql` script for DB schema.
* Fully working **PWA version**.
