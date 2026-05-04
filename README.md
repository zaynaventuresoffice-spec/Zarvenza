# Zarvenza — Full Stack Setup Guide

## Architecture

```
zarvenza-fullstack/
├── backend/              ← Node.js + Express + SQLite API
│   ├── server.js         ← Entry point (port 4000)
│   ├── db.js             ← SQLite database + schema
│   ├── middleware/
│   │   └── auth.js       ← JWT helpers + requireAuth middleware
│   └── routes/
│       ├── auth.js       ← /api/auth/* (signup, login, me, profile)
│       └── orders.js     ← /api/orders/* (create, list, detail, track, cancel)
└── frontend/             ← React + Vite (port 5173)
    └── src/
        ├── api.js                  ← API client (all fetch calls)
        ├── context/
        │   ├── AuthContext.jsx     ← Auth state + login/logout/signup
        │   └── CartContext.jsx     ← Cart state
        ├── components/
        │   ├── ProtectedRoute.jsx  ← Redirects to /login if not authenticated
        │   └── Navbar.jsx          ← Updated with user account dropdown
        └── pages/
            ├── Auth.jsx            ← Login / Signup (tabbed)
            ├── Orders.jsx          ← Order history list
            ├── OrderDetail.jsx     ← Order details + live tracking timeline
            └── Payment.jsx         ← Updated: creates real DB order on submit
```

## Database Schema (SQLite)

| Table            | Purpose                              |
|------------------|--------------------------------------|
| `users`          | Accounts with bcrypt-hashed passwords|
| `addresses`      | Saved delivery addresses             |
| `orders`         | Orders with status + payment info    |
| `order_items`    | Line items per order                 |
| `order_tracking` | Status history / event log           |
| `wishlist`       | Saved product wishlist               |

## API Endpoints

### Auth  (`/api/auth`)
| Method | Path        | Auth | Description            |
|--------|-------------|------|------------------------|
| POST   | /signup     | —    | Register new user      |
| POST   | /login      | —    | Login, returns JWT     |
| GET    | /me         | ✓    | Get current user       |
| PUT    | /profile    | ✓    | Update name/password   |

### Orders  (`/api/orders`)
| Method | Path                     | Auth | Description                  |
|--------|--------------------------|------|------------------------------|
| POST   | /                        | ✓    | Create new order              |
| GET    | /                        | ✓    | List user's orders            |
| GET    | /:id                     | ✓    | Order detail + tracking       |
| GET    | /track/:orderNumber      | ✓    | Track by order number         |
| PUT    | /:id/confirm-payment     | ✓    | Confirm GPay payment          |
| PUT    | /:id/cancel              | ✓    | Cancel pending order          |

## Protected Routes (Frontend)
| Route           | Description                             |
|-----------------|-----------------------------------------|
| `/login`        | Login / Signup page                     |
| `/signup`       | Redirects to Auth with signup tab       |
| `/payment`      | 🔒 Requires login                        |
| `/orders`       | 🔒 Order history                         |
| `/orders/:id`   | 🔒 Order detail + tracking timeline      |

---

## Setup & Run

### 1. Install & start the backend

```bash
cd backend
npm install
npm run dev
# API running at http://localhost:4000
```

### 2. Install & start the frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

### 3. Configure your UPI ID

In `frontend/src/pages/Payment.jsx`, replace:
```js
const GPAY_UPI_ID = 'YOUR_UPI_ID@bank';
```
with your actual UPI ID, e.g. `yourname@okaxis`.

---

## Order Status Flow

```
pending → confirmed → processing → shipped → delivered
                                              ↑
                    (cancelled at any point before shipped)
```

Each status transition adds a row to `order_tracking`, which powers the timeline on the Order Detail page.

## JWT Security

- Tokens are signed with `JWT_SECRET` (set via env var in production)
- Tokens expire in **7 days**
- All protected routes check `Authorization: Bearer <token>`
- Passwords are hashed with **bcrypt** (12 rounds)

## Production Checklist

- [ ] Set `JWT_SECRET` environment variable (strong random string)
- [ ] Set `GPAY_UPI_ID` to your actual UPI ID  
- [ ] Configure CORS `origin` in `backend/server.js` for your domain
- [ ] Use HTTPS in production
- [ ] Move SQLite DB to persistent storage / use PostgreSQL for scale
