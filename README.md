# Clinic Appointment Management App

A mobile and backend application for managing clinic appointments. The project includes appointment booking, rescheduling, cancellation, appointment history, and MongoDB data storage.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Mobile: React Native with Expo
- Testing: Node.js test runner

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

Set `MONGODB_URI` in `backend/.env` if your local or hosted MongoDB URL differs from the default.

Set `EXPO_PUBLIC_API_BASE_URL` in `mobile/.env` to the backend URL your device or simulator can reach.

- iOS simulator: `http://localhost:5001/api`
- Android emulator: `http://10.0.2.2:5001/api`
- Physical phone: `http://YOUR_COMPUTER_LOCAL_IP:5001/api`

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

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/me`

### Appointments

- `GET /api/appointments`
- `GET /api/appointments/:id`
- `POST /api/appointments`
- `PUT /api/appointments/:id`
- `DELETE /api/appointments/:id`

### Doctors

- `GET /api/doctors`
- `GET /api/doctors/:id`
- `POST /api/doctors`
- `PUT /api/doctors/:id`
- `DELETE /api/doctors/:id`

### Patients

- `GET /api/patients`
- `GET /api/patients/:id`
- `POST /api/patients`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`

### Schedules

- `GET /api/schedules`
- `GET /api/schedules/:id`
- `POST /api/schedules`
- `PUT /api/schedules/:id`
- `DELETE /api/schedules/:id`

### Medical Reports

- `GET /api/medical-reports`
- `GET /api/medical-reports/:id`
- `POST /api/medical-reports`
- `POST /api/medical-reports/:id/attachment`
- `PUT /api/medical-reports/:id`
- `DELETE /api/medical-reports/:id`

## Running Tests

```bash
npm run test:backend
```

## Database

The application uses the `clinic_appointment_app` MongoDB database and stores appointment records in the `appointments` collection.
