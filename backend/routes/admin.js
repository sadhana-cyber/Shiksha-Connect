const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');

const ROMAN_TO_INT = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6,
  VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12,
};

function normalizeClass(value) {
  if (value === undefined || value === null || value === '') return null;
  const asInt = parseInt(value, 10);
  if (!Number.isNaN(asInt) && asInt >= 1 && asInt <= 12) return asInt;
  const upper = String(value).toUpperCase().trim();
  return ROMAN_TO_INT[upper] || null;
}

// POST /api/admin/students/add
// body: { name, roll_no, class, section }
router.post('/students/add', async (req, res) => {
  try {
    const { name, roll_no, class: cls, section } = req.body || {};
    if (!name || !roll_no || cls === undefined || !section) {
      return res.status(400).json({ success: false, message: 'name, roll_no, class and section are required' });
    }

    const classNum = normalizeClass(cls);
    if (!classNum) {
      return res.status(400).json({ success: false, message: 'class must be between 1 and 12 (or roman numeral I-XII)' });
    }
    const sec = String(section).toUpperCase().trim();
    if (sec !== 'A' && sec !== 'B') {
      return res.status(400).json({ success: false, message: 'section must be A or B' });
    }
    const roll = parseInt(roll_no, 10);
    if (!roll || roll < 1) {
      return res.status(400).json({ success: false, message: 'roll_no must be a positive number' });
    }

    // Check roll uniqueness for class+section
    const dup = await db.query(
      'SELECT id FROM students WHERE class = $1 AND section = $2 AND roll_no = $3',
      [classNum, sec, roll]
    );
    if (dup.rowCount > 0) {
      return res.status(409).json({ success: false, message: 'Roll number already exists for this class and section' });
    }

    const qrValue = 'STU-' + crypto.randomUUID();

    const inserted = await db.query(
      `INSERT INTO students (name, roll_no, class, section, qr_value)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, roll_no, class, section, qr_value, is_active, created_at`,
      [String(name).trim(), roll, classNum, sec, qrValue]
    );

    res.json({ success: true, student: inserted.rows[0] });
  } catch (err) {
    console.error('POST /admin/students/add error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/students/remove
// body: { name?, roll_no?, class?, section?, id? } -> soft delete
router.put('/students/remove', async (req, res) => {
  try {
    const { id, name, roll_no, class: cls, section } = req.body || {};

    let result;
    if (id) {
      result = await db.query(
        'UPDATE students SET is_active = FALSE WHERE id = $1 RETURNING id, name, roll_no, class, section, is_active',
        [parseInt(id, 10)]
      );
    } else {
      const classNum = normalizeClass(cls);
      const sec = section ? String(section).toUpperCase().trim() : null;
      const roll = roll_no !== undefined ? parseInt(roll_no, 10) : null;
      if (!classNum || !sec || !roll) {
        return res.status(400).json({ success: false, message: 'Provide id OR (class, section, roll_no)' });
      }

      // Optional name match
      const params = [classNum, sec, roll];
      let where = 'class = $1 AND section = $2 AND roll_no = $3 AND is_active = TRUE';
      if (name) {
        params.push(String(name).trim());
        where += ' AND LOWER(name) = LOWER($4)';
      }
      result = await db.query(
        `UPDATE students SET is_active = FALSE WHERE ${where} RETURNING id, name, roll_no, class, section, is_active`,
        params
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, student: result.rows[0] });
  } catch (err) {
    console.error('PUT /admin/students/remove error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
