# Patient Management App

This standalone project contains the patient management slice extracted from the clinic app.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Mobile: React Native with Expo

## Project Structure

- `backend/` Express API and database logic for patient records and auth
- `mobile/` Expo mobile application for patient management

## Features

- Sign up or log in with admin or receptionist access
- View all active patients
- Create, edit, search, and remove patient records
- Store patient data in MongoDB

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

Start your local MongoDB service before launching the backend.

### 4. Run the backend

```bash
npm run dev:backend
```

### 5. Run the mobile app

```bash
npm run dev:mobile
```

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

## Running Tests

```bash
npm run test:backend
```

## Database

The application uses MongoDB for `users` and `patients`.
