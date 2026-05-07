const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/teacher/scan
// body: { qr_value, marked_by? }
router.post('/scan', async (req, res) => {
  try {
    const { qr_value, marked_by } = req.body || {};
    if (!qr_value) {
      return res.status(400).json({ success: false, status: 'invalid', message: 'qr_value is required' });
    }

    const r = await db.query(
      'SELECT id, name, roll_no, class, section, qr_value, is_active FROM students WHERE qr_value = $1',
      [String(qr_value).trim()]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({ success: false, status: 'invalid', message: 'Invalid student QR code.' });
    }
    const student = r.rows[0];
    if (!student.is_active) {
      return res.status(403).json({ success: false, status: 'removed', message: 'Student has been removed.' });
    }

    // Upsert attendance for today as PRESENT
    const upsert = await db.query(
      `INSERT INTO attendance (student_id, date, status, marked_by)
       VALUES ($1, CURRENT_DATE, 'PRESENT', $2)
       ON CONFLICT (student_id, date)
       DO UPDATE SET status = 'PRESENT', reason = NULL, marked_by = EXCLUDED.marked_by, updated_at = CURRENT_TIMESTAMP
       RETURNING id, student_id, date, status, marked_by`,
      [student.id, marked_by || 'teacher']
    );

    res.json({
      success: true,
      status: 'present',
      message: 'Attendance marked PRESENT',
      student: {
        id: student.id,
        name: student.name,
        roll_no: student.roll_no,
        class: student.class,
        section: student.section,
      },
      attendance: upsert.rows[0],
    });
  } catch (err) {
    console.error('POST /teacher/scan error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
