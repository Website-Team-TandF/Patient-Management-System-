# Admin API Integration Guide

This document explains how to integrate the admin APIs into your Express application.

## Routes Structure

The routes are organized in the following files:
- `src/routes/userRoutes.ts` - User management routes (admin section included)
- `src/routes/hospitalRoutes.ts` - Hospital management routes (admin section included)
- `src/routes/slotRoutes.ts` - Slot management routes (admin section included)

Each route file contains sections for different user roles. Admin routes are clearly marked.

## Integration Example

Add these routes to your `app.ts` or `server.ts`:

```typescript
import express from 'express';
import userRoutes from './routes/userRoutes';
import hospitalRoutes from './routes/hospitalRoutes';
import slotRoutes from './routes/slotRoutes';

const app = express();

// ... other middleware (body-parser, cors, etc.)

// Routes (each file handles its own authentication and role checking)
app.use('/user', userRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/slot', slotRoutes);

// ... rest of your app
```

## Role-Based Access Control

The system uses a flexible role-based middleware (`requireRole`) that allows:
- Multiple roles per endpoint
- Easy addition of new role-based routes
- Clear separation of admin vs other user routes within each file

Example:
```typescript
// Admin only
router.get('/', requireRole(['admin']), getAllUsers);

// Admin or Doctor
router.get('/profile', requireRole(['admin', 'doctor']), getUserProfile);

// Admin, Doctor, or Receptionist
router.get('/appointments', requireRole(['admin', 'doctor', 'receptionist']), getAppointments);
```

## API Endpoints

### Hospital Management (`/hospital`)

- `GET /hospital` - Get all hospitals (paginated)
  - Query params: `page`, `limit`
- `POST /hospital` - Create a new hospital
  - Body: `{ name: string, city: string }`
- `GET /hospital/:hospitalId` - Get hospital by ID
- `PUT /hospital/:hospitalId` - Update hospital
  - Body: `{ name?: string, city?: string }`

### User Management (`/user`)

- `GET /user` - Get all users (paginated, passwords excluded)
  - Query params: `page`, `limit`
- `POST /user` - Create a new user
  - Body: `{ fullName, email, password, userRoles, departments?, specializations?, consultationFee?, extraLine? }`
- `GET /user/:userId` - Get user by ID
- `PUT /user/:userId` - Update user
  - Body: `{ fullName?, email?, password?, departments?, specializations?, consultationFee?, extraLine? }`
- `POST /user/:userId/change-password` - Change user password
  - Body: `{ newPassword: string }`

### Slot Management (`/slot`)

- `POST /slot` - Create slots for a hospital
  - Body: `{ hospitalId, slotDuration (minutes), maxCapacity, numberOfDays (1-30, default 1) }`
- `GET /slot/hospital/:hospitalId` - Get all slots for a hospital (paginated)
  - Query params: `page`, `limit`
- `GET /slot/:slotId` - Get slot by ID
- `DELETE /slot/:slotId` - Delete slot (only if no bookings)

## Authentication

All routes require:
1. Valid JWT token in `Authorization: Bearer <token>` header
2. User must have `admin` role

## Password Requirements

Passwords must meet these criteria:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 numeric character
- At least 1 special character

Passwords are hashed using bcrypt before storage.

## Dependencies Required

Make sure these packages are installed:
- `express`
- `mongoose`
- `bcryptjs`
- `jsonwebtoken`
- `nanoid`

Install with:
```bash
npm install express mongoose bcryptjs jsonwebtoken nanoid
npm install --save-dev @types/express @types/bcryptjs @types/jsonwebtoken @types/node
```

