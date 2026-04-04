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

Copy the example files and update them for your machine:

```bash
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env
```

Set `MONGODB_URI` in `backend/.env` if your local MongoDB URL differs from the default.

Set `EXPO_PUBLIC_API_BASE_URL` in `mobile/.env` to the backend URL your device or simulator can reach.

- iOS simulator: `http://localhost:5001/api/appointments`
- Android emulator: `http://10.0.2.2:5001/api/appointments`
- Physical phone: `http://YOUR_COMPUTER_LOCAL_IP:5001/api/appointments`

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

If you test the Expo app on a physical phone, make sure `EXPO_PUBLIC_API_BASE_URL` in [mobile/.env.example](/Users/sandarunipuna/Documents/Projects/Clinic Appointment Management App/mobile/.env.example) uses your computer's local IP address instead of `localhost`.

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
