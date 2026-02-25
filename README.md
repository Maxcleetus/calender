# Priest Booking System (MERN)

Full MERN project with separate apps:

- `server` -> Backend API (Node.js + Express + MongoDB)
- `client` -> Public church booking calendar
- `admin` -> Admin panel for viewing and managing bookings

## Features

- Single-priest booking flow
- Calendar-based booking UI
- Booked slots visible directly inside calendar dates
- Overlap prevention (no double booking)
- Separate admin login and booking management
- Confirm/cancel booking status controls in admin panel

## 1) Backend Setup (`server`)

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

## 2) Public Frontend Setup (`client`)

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Public booking UI runs on `http://localhost:5173`.

## 3) Admin Panel Setup (`admin`)

```bash
cd admin
cp .env.example .env
npm install
npm run dev
```

Admin panel runs on `http://localhost:5174`.

## Admin Login

By default (from `server/.env.example`):

- Username: `admin`
- Password: `admin123`

Change these values in `server/.env` before production use.

## API Overview

- `GET /api/bookings/:year/:month` -> month bookings for calendar (confirmed and cancelled)
- `POST /api/bookings` -> create public booking
- `POST /api/admin/login` -> admin auth token
- `GET /api/admin/bookings?year=YYYY&month=MM&status=` -> admin booking list
- `PATCH /api/admin/bookings/:id/status` -> update booking status

## Notes

- MongoDB must be running locally (or use a cloud URI).
- Conflict checks are enforced at backend level.
- `client` displays both confirmed and cancelled bookings, with cancelled shown as marked status.
