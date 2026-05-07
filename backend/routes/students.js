const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/students?class=8&section=A
router.get('/', async (req, res) => {
  try {
    const classNum = parseInt(req.query.class, 10);
    const section = req.query.section ? String(req.query.section).toUpperCase() : null;

    if (!classNum || !section) {
      return res.status(400).json({ error: 'class and section query params are required' });
    }

    const r = await db.query(
      `SELECT id, name, roll_no, class, section, qr_value, is_active, created_at
       FROM students
       WHERE class = $1 AND section = $2 AND is_active = TRUE
       ORDER BY roll_no ASC`,
      [classNum, section]
    );
    res.json({ students: r.rows });
  } catch (err) {
    console.error('GET /students error:', err);
    res.status(500).json({ error: err.message });
  }
});
// GET /api/students/next-roll?class=8&section=A
router.get('/next-roll', async (req, res) => {
  try {
    const classNum = parseInt(req.query.class, 10);
    const section = req.query.section ? String(req.query.section).toUpperCase() : null;
    if (!classNum || !section) {
      return res.status(400).json({ error: 'class and section query params are required' });
    }
    const r = await db.query(
      `SELECT COALESCE(MAX(roll_no), 0) AS max_roll
       FROM students
       WHERE class = $1 AND section = $2`,
      [classNum, section]
    );
    const next_roll = (r.rows[0].max_roll || 0) + 1;
    res.json({ class: classNum, section, next_roll });
  } catch (err) {
    console.error('GET /students/next-roll error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
