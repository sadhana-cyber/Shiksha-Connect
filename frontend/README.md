# Attendance Management - Frontend

Create React App + Tailwind frontend for the Shiksha Connect attendance management system.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Make sure backend is running on http://localhost:5000
#    (or edit .env if backend is on a different URL)

# 3. Start dev server
npm start
# Frontend: http://localhost:3000
```

## Configuration

The backend URL is read from `REACT_APP_BACKEND_URL` in `.env`:

```
REACT_APP_BACKEND_URL=http://localhost:5000
```

## Login

- **Admin**: `admin` / `admin2627`
- **Teacher**: Class ID `VIIIA` / Password `VIIIA2627` (any class I-X with section A or B)

## QR Scanning

The app uses your laptop webcam via `html5-qrcode`. Your browser will ask for camera permission the first time you click **Start Camera**.

## QR Generation

When the admin adds a new student, a unique QR string is generated and stored in the database. The frontend renders the QR image using the `qrcode` library and displays it in the dashed preview box.
