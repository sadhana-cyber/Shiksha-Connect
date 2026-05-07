-- Attendance Management Database Schema
-- Run this BEFORE seed.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(20) UNIQUE NOT NULL,
    class INT NOT NULL CHECK (class BETWEEN 1 AND 12),
    section CHAR(1) NOT NULL CHECK (section IN ('A', 'B')),
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_no INT NOT NULL,
    class INT NOT NULL CHECK (class BETWEEN 1 AND 12),
    section CHAR(1) NOT NULL CHECK (section IN ('A', 'B')),
    qr_value VARCHAR(200) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class, section, roll_no)
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY')),
    reason TEXT,
    marked_by VARCHAR(10),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, date)
);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    class INT,
    section CHAR(1),
    from_date DATE,
    to_date DATE,
    report_type VARCHAR(20),
    report_json JSONB,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_class_section ON students(class, section);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);
