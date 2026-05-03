<<<<<<< HEAD
# Clinic Appointment Management App

A mobile and backend application for managing clinic appointments. The project includes appointment booking, rescheduling, cancellation, appointment history, and MongoDB data storage.
=======
# Patient Management App

This standalone project contains the patient management slice extracted from the clinic app.
>>>>>>> 4a883649 (patient management module added)

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Mobile: React Native with Expo
<<<<<<< HEAD
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
=======

## Project Structure

- `backend/` Express API and database logic for patient records and auth
- `mobile/` Expo mobile application for patient management

## Features

- Sign up or log in with admin or receptionist access
- View all active patients
- Create, edit, search, and remove patient records
- Store patient data in MongoDB
>>>>>>> 4a883649 (patient management module added)

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

- iOS simulator: `http://localhost:5001/api`
- Android emulator: `http://10.0.2.2:5001/api`
- Physical phone: `http://YOUR_COMPUTER_LOCAL_IP:5001/api`

### 3. Start MongoDB

<<<<<<< HEAD
If MongoDB is installed with Homebrew:

```bash
brew services start mongodb-community
```
=======
Start your local MongoDB service before launching the backend.
>>>>>>> 4a883649 (patient management module added)

### 4. Run the backend

```bash
npm run dev:backend
```

### 5. Run the mobile app

```bash
npm run dev:mobile
```

<<<<<<< HEAD
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
=======
## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `GET /api/patients`
- `GET /api/patients/:id`
- `POST /api/patients`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`
>>>>>>> 4a883649 (patient management module added)

## Running Tests

```bash
npm run test:backend
```

## Database

<<<<<<< HEAD
The application uses the `clinic_appointment_app` MongoDB database and stores appointment records in the `appointments` collection.
=======
The application uses MongoDB for `users` and `patients`.
>>>>>>> 4a883649 (patient management module added)
