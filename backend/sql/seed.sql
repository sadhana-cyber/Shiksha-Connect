-- Attendance Management Seed Data
-- Run AFTER schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clear existing data
TRUNCATE TABLE reports, attendance, students, teachers, admins RESTART IDENTITY CASCADE;

-- =========================================================
-- Admin
-- =========================================================
INSERT INTO admins (username, password) VALUES ('admin', 'admin2627');

-- =========================================================
-- Teachers (classes 1..10, sections A and B)
-- user_id format: roman numeral + section, e.g. IA, IB, IIA, IIB, ... XA, XB
-- password format: <user_id>2627  e.g. IA2627
-- =========================================================
DO $$
DECLARE
    roman TEXT;
    sec   TEXT;
    cls   INT;
    uid   TEXT;
    romans TEXT[] := ARRAY['I','II','III','IV','V','VI','VII','VIII','IX','X'];
BEGIN
    FOR cls IN 1..10 LOOP
        roman := romans[cls];
        FOREACH sec IN ARRAY ARRAY['A','B'] LOOP
            uid := roman || sec;
            INSERT INTO teachers (user_id, class, section, password, is_active)
            VALUES (uid, cls, sec, uid || '2627', TRUE);
        END LOOP;
    END LOOP;
END $$;

-- =========================================================
-- Students: 10 students per class-section, roll 1..10
-- qr_value = 'STU-' || gen_random_uuid()
-- =========================================================
DO $$
DECLARE
    cls INT;
    sec TEXT;
    roll INT;
    first_names TEXT[] := ARRAY[
        'Aarav','Priya','Rohan','Sneha','Karan','Meena','Arjun','Diya','Vikram','Anaya',
        'Aditya','Isha','Kabir','Riya','Aryan','Tara','Dev','Pooja','Yash','Sara'
    ];
    last_names TEXT[] := ARRAY[
        'Sharma','Patel','Verma','Yadav','Singh','Kumari','Gupta','Reddy','Iyer','Nair',
        'Mehta','Joshi','Das','Khan','Roy','Bose','Pillai','Naidu','Jain','Mishra'
    ];
    full_name TEXT;
    fn_idx INT;
    ln_idx INT;
BEGIN
    FOR cls IN 1..10 LOOP
        FOREACH sec IN ARRAY ARRAY['A','B'] LOOP
            FOR roll IN 1..10 LOOP
                fn_idx := ((cls * 17 + (CASE WHEN sec = 'A' THEN 0 ELSE 7 END) + roll) % array_length(first_names, 1)) + 1;
                ln_idx := ((cls * 11 + (CASE WHEN sec = 'A' THEN 3 ELSE 13 END) + roll * 2) % array_length(last_names, 1)) + 1;
                full_name := first_names[fn_idx] || ' ' || last_names[ln_idx];
                INSERT INTO students (name, roll_no, class, section, qr_value, is_active)
                VALUES (full_name, roll, cls, sec, 'STU-' || gen_random_uuid()::text, TRUE);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
