# Attendance Management - Backend

Express + PostgreSQL REST API for the Shiksha Connect attendance management system.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy and edit env file
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Create database (run from psql once)
#    CREATE DATABASE attendance_management;

# 4. Run schema and seed
psql -U postgres -d attendance_management -f sql/schema.sql
psql -U postgres -d attendance_management -f sql/seed.sql

# 5. Start backend
npm start
# Server: http://localhost:5000
```

## Endpoints

- `POST /api/auth/teacher-login` — body `{ user_id, password }`
- `POST /api/auth/admin-login` — body `{ username, password }`
- `POST /api/admin/students/add` — body `{ name, roll_no, class, section }`
- `PUT  /api/admin/students/remove` — body `{ id }` or `{ name, roll_no, class, section }`
- `GET  /api/students?class=8&section=A`
- `POST /api/teacher/scan` — body `{ qr_value, marked_by? }`
- `GET  /api/attendance?class=8&section=A&date=YYYY-MM-DD`
- `PUT  /api/attendance/update` — body `{ updates: [{student_id, date, status, reason?, marked_by?}] }`
- `GET  /api/reports/generate?class=8&section=A&type=Weekly|Monthly`
- `POST /api/reports/submit` — body `{ class, section, from_date, to_date, report_type, report_json }`

## Default credentials

- **Admin**: username `admin` / password `admin2627`
- **Teachers**: user_id like `IA`, `IB`, ..., `XA`, `XB` / password `<user_id>2627` (e.g. `VIIIA2627`)
