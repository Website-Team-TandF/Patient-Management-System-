# Patient Management System

This repository contains a React + TypeScript frontend and a Node.js + Express + TypeScript backend. The backend is the main server for all Clinics management APIs, authentication, booking, visits, pharmacy, analytics, and lead handling.

---

## Quick Start

### Backend
1. Open a terminal in `backend`
2. Install dependencies:
   - `npm install`
3. Create `.env` from `.env.example` if available, or add:
   ```env
   PORT=3000
   MONGODB_URI=<your-mongo-uri>
   JWT_SECRET=<your-secret>
   JWT_EXPIRES_IN=24h
   ```
4. Start the backend server:
   - `npm run dev`

### Frontend
1. Open a terminal in the project root
2. Install dependencies:
   - `npm install`
3. Start the frontend app:
   - `npm run dev`
4. Open the app in the browser at:
   - `http://localhost:5173`

> Note: `.env` is ignored by git to protect secrets.

---

## Backend Overview

The backend is located in `backend/` and follows a standard Express + TypeScript structure.

### Main flow

1. `backend/src/app.ts`
   - Creates the Express app
   - Loads middleware: `cors`, `cookie-parser`, `express.json()`
   - Mounts route groups under `/api/...`
   - Connects to MongoDB using `backend/src/config/db.ts`
   - Starts the server on `PORT`

2. `backend/src/config/env.ts`
   - Loads environment variables using `dotenv`
   - Exposes configuration values like `MONGODB_URI`, `JWT_SECRET`, and `PORT`

3. `backend/src/config/db.ts`
   - Uses `mongoose` to connect to the MongoDB database
   - Logs connection success or failure

4. `backend/src/routes/` files
   - Define API endpoints and route groups
   - Apply authentication and role-based access control
   - Forward requests to controllers

5. `backend/src/controllers/` files
   - Contain the business logic for each route
   - Fetch data from models, validate requests, and return JSON responses

6. `backend/src/models/` files
   - Define MongoDB schemas and data models with Mongoose
   - Represent entities such as users, hospitals, appointments, patients, visits, medicines, leads, and more

7. `backend/src/middlewares/`
   - Manage authentication, role authorization, error handling, rate limiting, and request validation

8. `backend/src/utils/`
   - Provide helper functions for JWT, email, password hashing, ID generation, and time utilities

9. `backend/src/services/`
   - Contain reusable logic for complex operations such as appointments, bookings, patients, and visits

---

## Important Backend Libraries

- `express` — Backend HTTP server framework
- `mongoose` — MongoDB object modeling and schema definitions
- `dotenv` — Load `.env` configuration values
- `jsonwebtoken` — Create and verify JWT tokens for auth
- `bcryptjs` — Hash user passwords securely
- `cookie-parser` — Read cookies from incoming requests
- `cors` — Allow frontend apps to access backend APIs
- `ts-node-dev` — Run TypeScript server during development with auto-restart
- `typescript` — Type safety and tooling for backend code

---

## Backend API Groups

### Authentication & User Management
- `POST /api/users/login` — login user, returns JWT token
- `POST /api/users/logout` — log out user
- `GET /api/users/me` — get current logged-in user
- Admin-only user management routes under `/api/users`

### Hospital Management
- `GET /api/hospitals` — public hospital list
- `POST /api/hospitals` — create hospital (admin)
- `GET /api/hospitals/:hospitalId` — get hospital details (admin)
- `PUT /api/hospitals/:hospitalId` — update hospital (admin)

### Slot Management
- `POST /api/slots` — create slots for hospitals (admin)
- `GET /api/slots/hospital/:hospitalId` — list slots by hospital (admin)
- `GET /api/slots/:slotId` — slot details (admin)
- `DELETE /api/slots/:slotId` — remove slot (admin)
- `DELETE /api/slots/hospital/:hospitalId` — remove slots by date (admin)

### Appointment Management
- `GET /api/appointments/today` — today's appointments (receptionist/admin)
- `GET /api/appointments/:appointmentId` — appointment details (receptionist/admin)
- `PATCH /api/appointments/:appointmentId/check-in` — check in appointment (receptionist/admin)
- `GET /api/appointments/admin/all` — admin appointment list
- `GET /api/appointments/admin/analysis` — admin appointment analytics

### Patient Management
- `GET /api/patients/:patientId` — patient details (receptionist/admin)
- `POST /api/patients` — create patient (receptionist/admin)
- `GET /api/patients` — list patients (doctor/admin)

### Visit Management
- `POST /api/visits` — create visit / check-in (receptionist/admin)
- `POST /api/visits/offline` — create offline walk-in visit (receptionist/admin)
- `GET /api/visits/search` — search visit by token (doctor/admin)
- `GET /api/visits/today` — today's visits (doctor/admin)
- `PUT /api/visits/:visitId` — update visit details (doctor/admin)
- `GET /api/visits/patient/:patientId/history` — patient visit history (doctor/admin)
- `GET /api/visits/slip` — visit slip by token (receptionist/doctor/admin)
- `GET /api/visits/slip/:visitId` — visit slip by ID (receptionist/doctor/admin)

### Public Booking
- `GET /api/public/booking/slots/:hospitalId` — public available slots
- `GET /api/public/booking/slots/window/:hospitalId` — next slot windows
- `POST /api/public/booking/slots/lock` — lock a slot during checkout
- `DELETE /api/public/booking/slots/lock/:lockId` — release a slot lock
- `POST /api/public/booking/confirm` — confirm booking after payment

### Metadata
- `GET /api/metadata` — public metadata for forms and dropdowns
- `PATCH /api/metadata` — update metadata (admin)

### Leads
- `POST /api/leads` — create a new lead
- `GET /api/leads/analysis/unconverted` — get unconverted leads
- `GET /api/leads/:id` — get lead by ID
- `PATCH /api/leads/:id/status` — update lead status

### Pharmacist APIs
- `GET /api/pharmacist/visit/search` — search visit by token
- `GET /api/pharmacist/visit/search-optimized` — improved visit search
- `POST /api/pharmacist/give-medicine` — dispense medicines
- `GET /api/pharmacist/medicines` — list medicines
- `GET /api/pharmacist/medicines/names` — medicine names
- `GET /api/pharmacist/medicine/:id` — medicine details
- `GET /api/pharmacist/medicines/detail` — exact medicine name search
- `POST /api/pharmacist/medicines` — add medicine
- `POST /api/pharmacist/medicines/bulk` — bulk add medicines
- `PUT /api/pharmacist/medicines/bulk` — bulk update medicines
- `PUT /api/pharmacist/medicines/:id` — update medicine

### Analytics
- `GET /api/analytics/hospitals` — hospital visit analytics
- `GET /api/analytics/diseases` — disease analytics
- `GET /api/analytics/treatments` — treatment analytics

---

## Developer Guide for Backend

### How requests flow

1. The frontend or external client calls an API under `/api/...`.
2. The route file in `backend/src/routes` receives the request.
3. If the route is protected, `authMiddleware` checks the JWT token and user role.
4. The controller in `backend/src/controllers` runs business logic.
5. Controllers use models, services, and utilities to access or update MongoDB.
6. The response is returned as JSON.

### Best place to start

- Start at `backend/src/app.ts`
- Open the route file in `backend/src/routes` for the feature you need
- Follow the controller in `backend/src/controllers`
- Check the schema in `backend/src/models`
- Use `backend/src/middlewares` for auth and validation logic

### Adding a new backend feature

1. Add a route in `backend/src/routes/<feature>Routes.ts`
2. Write the controller in `backend/src/controllers/<feature>Controller.ts`
3. Create or update the model in `backend/src/models`
4. Call helpers from `backend/src/utils` or `backend/src/services` if needed
5. Add role checks using `authMiddleware` and `requireRole`

---

## Frontend Notes

The frontend is built with Vite, React, and TypeScript. It is mostly in the root `src/` folder and uses `package.json` scripts:

- `npm run dev` — start Vite development server
- `npm run build` — create production build
- `npm run preview` — preview the production build

The frontend communicates with the backend at `http://localhost:3000` by default.

---

## Environment and Secrets

The backend uses environment variables from `.env`:

- `PORT` — backend server port
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing authentication tokens
- `JWT_EXPIRES_IN` — token expiry window

Do not commit `.env` to GitHub. Keep secrets out of source control.
