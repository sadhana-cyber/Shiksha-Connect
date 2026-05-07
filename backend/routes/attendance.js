const express = require('express');
const router = express.Router();
const db = require('../db');

const VALID_STATUSES = new Set(['PRESENT', 'ABSENT', 'HALF_DAY']);

// GET /api/attendance?class=8&section=A&date=2026-04-24
router.get('/', async (req, res) => {
  try {
    const classNum = parseInt(req.query.class, 10);
    const section = req.query.section ? String(req.query.section).toUpperCase() : null;
    const date = req.query.date || null;

    if (!classNum || !section) {
      return res.status(400).json({ error: 'class and section are required' });
    }

    const targetDate = date || new Date().toISOString().slice(0, 10);

    const r = await db.query(
      `SELECT s.id AS student_id, s.name, s.roll_no, s.class, s.section,
              COALESCE(a.status, 'ABSENT') AS status,
              a.reason, a.marked_by, a.updated_at,
              $3::date AS date
       FROM students s
       LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $3::date
       WHERE s.class = $1 AND s.section = $2 AND s.is_active = TRUE
       ORDER BY s.roll_no ASC`,
      [classNum, section, targetDate]
    );

    res.json({ date: targetDate, attendance: r.rows });
  } catch (err) {
    console.error('GET /attendance error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/attendance/update
// body: { updates: [{student_id, date, status, reason?, marked_by?}, ...] }
router.put('/update', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { updates } = req.body || {};
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'updates array is required' });
    }

    await client.query('BEGIN');
    const saved = [];
    for (const u of updates) {
      const studentId = parseInt(u.student_id, 10);
      const date = u.date || new Date().toISOString().slice(0, 10);
      const status = String(u.status || '').toUpperCase();
      if (!studentId || !VALID_STATUSES.has(status)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: `Invalid update for student_id=${u.student_id}` });
      }
      const r = await client.query(
        `INSERT INTO attendance (student_id, date, status, reason, marked_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (student_id, date)
         DO UPDATE SET status = EXCLUDED.status,
                       reason = EXCLUDED.reason,
                       marked_by = EXCLUDED.marked_by,
                       updated_at = CURRENT_TIMESTAMP
         RETURNING id, student_id, date, status, reason, marked_by`,
        [studentId, date, status, u.reason || null, u.marked_by || 'teacher']
      );
      saved.push(r.rows[0]);
    }
    await client.query('COMMIT');
    res.json({ success: true, saved });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT /attendance/update error:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
