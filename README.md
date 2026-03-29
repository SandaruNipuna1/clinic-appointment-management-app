# Clinic Appointment Management App

A mobile and backend application for managing clinic appointments. The project includes appointment booking, rescheduling, cancellation, appointment history, and MongoDB data storage.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Mobile: React Native with Expo
- Testing: Jest

## Project Structure

- `backend/` Express API and database logic
- `mobile/` Expo mobile application

## Features

- Create a new appointment
- View all appointments
- View appointments by patient
- Update appointment date and time
- Cancel an appointment
- Prevent double-booking for the same doctor and time slot
- Store appointment data in MongoDB
- Run backend tests for appointment logic

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and update it if needed:

```bash
cp backend/.env.example backend/.env
```

### 3. Start MongoDB

If MongoDB is installed with Homebrew:

```bash
brew services start mongodb-community
```

### 4. Run the backend

```bash
npm run dev:backend
```

### 5. Run the mobile app

```bash
npm run dev:mobile
```

## Mobile Testing

If you test the Expo app on a physical phone, replace `localhost` in [mobile/src/services/appointmentApi.js](/Users/sandarunipuna/Documents/Projects/Clinic Appointment Management App/mobile/src/services/appointmentApi.js) with your computer's local IP address.

Example:

```js
const API_BASE_URL = "http://192.168.1.10:5001/api/appointments";
```

## API Endpoints

- `POST /api/appointments`
- `GET /api/appointments`
- `GET /api/appointments/:id`
- `GET /api/appointments/patient/:patientId`
- `PATCH /api/appointments/:id`
- `PATCH /api/appointments/:id/cancel`
- `DELETE /api/appointments/:id`

## Running Tests

```bash
npm run test:backend
```

## Database

The application uses the `clinic_appointment_app` MongoDB database and stores appointment records in the `appointments` collection.
