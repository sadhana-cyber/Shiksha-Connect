# Attendance Management (Shiksha Connect)

A complete full-stack attendance management system with QR code scanning, role-based access (Admin / Teacher), and PostgreSQL persistence.

## Stack

- **Frontend**: React (Create React App) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **QR Scanning**: `html5-qrcode` (real laptop webcam)
- **QR Generation**: `qrcode` npm library

---

## Project Structure

```
attendance-management/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── db.js
│   ├── .env.example
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── teacher.js
│   │   ├── attendance.js
│   │   ├── reports.js
│   │   └── students.js
│   ├── sql/
│   │   ├── schema.sql
│   │   └── seed.sql
│   └── README.md
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── README.md
└── README.md
```

---

## Quick Start (5 steps)

### 1. Install PostgreSQL

Make sure PostgreSQL 13+ is installed and running on your laptop.
On macOS: `brew install postgresql && brew services start postgresql`
On Ubuntu: `sudo apt install postgresql && sudo service postgresql start`
On Windows: install from <https://www.postgresql.org/download/windows/>.

### 2. Create the database

```bash
psql -U postgres -c "CREATE DATABASE attendance_management;"
```

### 3. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
#  edit .env if your DB user/password differ from defaults
psql -U postgres -d attendance_management -f sql/schema.sql
psql -U postgres -d attendance_management -f sql/seed.sql
npm start
# → Backend running on http://localhost:5000
```

### 4. Set up the frontend (in a separate terminal)

```bash
cd frontend
npm install
npm start
# → Frontend running on http://localhost:3000
```

### 5. Open the app

Visit <http://localhost:3000> in your browser.

---

## Default Credentials

| Role | Username / Class ID | Password |
| --- | --- | --- |
| **Admin** | `admin` | `admin2627` |
| **Teacher (Class VIII-A)** | `VIIIA` | `VIIIA2627` |
| **Teacher (Class IX-B)** | `IXB` | `IXB2627` |
| **Teacher (Class X-A)** | `XA` | `XA2627` |

Teachers exist for all classes **I to X**, sections **A and B**.
The password format is `<user_id><acad_year>` where `acad_year` is consecutive (e.g. `2324`, `2425`, `2526`, `2627`, `2728`).

The admin password follows the same pattern: `admin<acad_year>`.

---

## Features

### Teacher

- **Scan QR Attendance** — opens your laptop webcam and scans student QR codes. Each scan upserts the attendance record for today as `PRESENT`. Invalid or removed students are rejected.
- **View Student Attendance** — view today's attendance for the teacher's class and edit between Present / Absent / Half Day.
- **Leave Entry** — pick a student, reason, and half-day flag. Saves as `HALF_DAY` (if checked) or `ABSENT` with the reason.

### Admin

- **Add New Student** — creates the student row with a unique QR value (`STU-<uuid>`). The frontend immediately renders a real QR image you can print or screenshot.
- **Remove Student** — soft delete (`is_active = FALSE`). The row is kept for historical attendance.
- **Modify Attendance** — change today's attendance for any class.
- **Generate Reports** — Weekly (last 7 days) or Monthly (last 30 days). Submitting saves the JSON to the `reports` table.

---

## Backend API

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/teacher-login` | Teacher login |
| POST | `/api/auth/admin-login` | Admin login |
| POST | `/api/admin/students/add` | Add a student (returns QR value) |
| PUT | `/api/admin/students/remove` | Soft delete a student |
| GET | `/api/students?class=&section=` | List active students of a class-section |
| POST | `/api/teacher/scan` | Validate QR and mark attendance |
| GET | `/api/attendance?class=&section=&date=` | Today's (or any date) attendance for a class |
| PUT | `/api/attendance/update` | Bulk upsert attendance updates |
| GET | `/api/reports/generate?class=&section=&type=` | Generate Weekly / Monthly report |
| POST | `/api/reports/submit` | Persist a generated report |
| GET | `/api/health` | Health + DB ping |

---

## Database Schema

The full schema is in `backend/sql/schema.sql`. Tables:

- `admins`
- `teachers`
- `students` (with unique `qr_value` column)
- `attendance` (upsert by `(student_id, date)`, statuses `PRESENT | ABSENT | HALF_DAY`)
- `reports` (JSONB storage)

---

## Browser Camera Notes

`html5-qrcode` requires camera access. Most browsers only allow camera access from `https://` **or** `http://localhost`. Since the dev server runs on `localhost:3000`, this works out of the box on Chrome / Edge / Firefox / Safari.

If your browser blocks the camera, click the camera icon in the URL bar and grant permission.

---

## Troubleshooting

- **`ECONNREFUSED` from backend on startup** — PostgreSQL isn't running, or the credentials in `backend/.env` are wrong.
- **`relation "students" does not exist`** — you forgot to run `schema.sql`. Re-run step 3.
- **Camera doesn't open** — your browser blocked it; check the address bar permissions, then refresh.
- **Login fails** — make sure the seed ran. Use exactly `admin` / `admin2627` (admin) or `VIIIA` / `VIIIA2627` (teacher).
- **Frontend can't reach backend** — confirm both ports are free and `REACT_APP_BACKEND_URL` in `frontend/.env` matches your backend URL.

---

## License

MIT
