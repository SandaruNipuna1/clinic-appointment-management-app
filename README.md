# Clinic Appointment Management App

This workspace is scaffolded for the **Appointment Management** module.

## Your Member 2 Scope

- Create appointment
- View all appointments
- View patient appointments
- Update appointment date and time
- Cancel appointment
- Add mobile UI for appointment flows
- Add routes, controllers, MongoDB integration, and testing

## Suggested Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Mobile UI: React Native with Expo
- Testing: Jest and Supertest

## Project Structure

- `backend/` API for appointments
- `mobile/` React Native appointment UI starter

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure backend environment

Copy `backend/.env.example` to `backend/.env` and update values.

### 3. Run backend

```bash
npm run dev:backend
```

### 4. Run mobile app

```bash
npm run dev:mobile
```

## Important for Mobile Testing

If you run the Expo app on a physical phone, `localhost` will not point to your laptop.

Update [mobile/src/services/appointmentApi.js](/Users/sandarunipuna/Documents/Projects/Clinic Appointment Management App/mobile/src/services/appointmentApi.js) and replace:

```js
http://localhost:5000
```

with your computer's local IP address, for example:

```js
http://192.168.1.10:5000
```

## API Endpoints

- `POST /api/appointments`
- `GET /api/appointments`
- `GET /api/appointments/:id`
- `GET /api/appointments/patient/:patientId`
- `PATCH /api/appointments/:id`
- `PATCH /api/appointments/:id/cancel`
- `DELETE /api/appointments/:id`

## Implementation Roadmap

1. Finish the appointment backend first.
2. Connect mobile screens to the API.
3. Add conflict checks with doctor schedule availability.
4. Add tests and validation improvements.

## Demo Flow for Member 2

1. Create an appointment using patient ID and doctor ID.
2. Show all appointments in the history list.
3. Explain that duplicate doctor slots are blocked.
4. Update an appointment time using `PATCH /api/appointments/:id`.
5. Cancel an appointment using `PATCH /api/appointments/:id/cancel`.

## Team Integration Notes

- Member 1 provides doctor data.
- Member 3 provides patient profile data.
- Member 4 provides schedule and slot validation.
- Member 5 can attach prescriptions and reports to appointments later.
