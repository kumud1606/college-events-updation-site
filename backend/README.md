# Backend Setup

This backend is now a working Express + MongoDB API for the college clubs project.

## What is included

- JWT-based authentication
- Student profile and club preference APIs
- Club listing API
- Event listing plus manager/admin create, update, and delete APIs
- Event registrations for students
- Certificate issuing and download tracking
- Seed script with demo users, clubs, and events

## Quick start

1. Make sure MongoDB is running locally on `mongodb://127.0.0.1:27017`
2. Open a terminal in `backend`
3. Copy `.env.example` to `.env`
4. Run `npm install`
5. Run `npm run seed`
6. Run `npm run dev`

The API starts on `http://localhost:5000` by default.

## Demo accounts after seeding

- Admin: `GEU2026001 / Admin@123`
- Manager: `GEU2026101 / Manager@123`
- Student: `GEU2026201 / Student@123`

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/me/clubs`
- `GET /api/clubs`
- `GET /api/events`
- `GET /api/events/:eventId`
- `POST /api/events`
- `PATCH /api/events/:eventId`
- `DELETE /api/events/:eventId`
- `GET /api/registrations/mine`
- `POST /api/registrations`
- `GET /api/certificates`
- `POST /api/certificates/issue`
- `PATCH /api/certificates/:certificateId/download`

## Example login request

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"enrollment\":\"GEU2026201\",\"password\":\"Student@123\"}"
```

Use the returned token as:

```bash
Authorization: Bearer <token>
```
