const express = require('express');
const router = express.Router();
const db = require('../db');

const ROMAN_TO_INT = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6,
  VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12,
};

function parseRoman(str) {
  return ROMAN_TO_INT[String(str).toUpperCase()] || null;
}

function isValidAcadYear(year) {
  // year format: YYYY where the two halves are consecutive years (last two digits)
  // e.g. 2324, 2425, 2526, 2627, 2728 ...
  if (!/^\d{4}$/.test(year)) return false;
  const first = parseInt(year.slice(0, 2), 10);
  const second = parseInt(year.slice(2, 4), 10);
  return second === first + 1;
}

// POST /api/auth/teacher-login
// body: { user_id: 'VIIIA', password: 'VIIIA2627' }
router.post('/teacher-login', async (req, res) => {
  try {
    const { user_id, password } = req.body || {};
    if (!user_id || !password) {
      return res.status(400).json({ success: false, message: 'user_id and password are required' });
    }

    const uid = String(user_id).toUpperCase().trim();
    // user_id pattern: roman numeral (I-XII) followed by section A or B
    const m = uid.match(/^(I{1,3}|IV|V|VI{0,3}|IX|X|XI|XII)([AB])$/);
    if (!m) {
      return res.status(400).json({ success: false, message: 'Invalid Class ID format. Expected like VIIIA or IXB.' });
    }

    const roman = m[1];
    const section = m[2];
    const classNum = parseRoman(roman);
    if (!classNum || classNum < 1 || classNum > 12) {
      return res.status(400).json({ success: false, message: 'Class must be I to XII.' });
    }

    // Validate password format: <user_id><acad_year>
    if (!password.toUpperCase().startsWith(uid)) {
      return res.status(401).json({ success: false, message: 'Invalid password format.' });
    }
    const acadYear = password.slice(uid.length);
    if (!isValidAcadYear(acadYear)) {
      return res.status(401).json({ success: false, message: 'Academic year must be in consecutive format like 2324, 2425, 2627.' });
    }

    // Validate teacher exists
    const result = await db.query(
      'SELECT id, user_id, class, section, is_active FROM teachers WHERE user_id = $1',
      [uid]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ success: false, message: 'Teacher not found.' });
    }
    const teacher = result.rows[0];
    if (!teacher.is_active) {
      return res.status(403).json({ success: false, message: 'Teacher account is inactive.' });
    }

    return res.json({
      success: true,
      teacher: {
        id: teacher.id,
        user_id: teacher.user_id,
        class: teacher.class,
        section: teacher.section,
        roman,
        class_label: `${roman}-${section}`,
      },
    });
  } catch (err) {
    console.error('teacher-login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/admin-login
// body: { username: 'admin', password: 'admin2627' }
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'username and password are required' });
    }

    if (username !== 'admin') {
      return res.status(401).json({ success: false, message: 'Username must be admin.' });
    }

    if (!password.startsWith('admin')) {
      return res.status(401).json({ success: false, message: 'Invalid password format.' });
    }
    const acadYear = password.slice('admin'.length);
    if (!isValidAcadYear(acadYear)) {
      return res.status(401).json({ success: false, message: 'Academic year must be in consecutive format like 2324, 2425, 2627.' });
    }

    const result = await db.query('SELECT id, username FROM admins WHERE username = $1', [username]);
    if (result.rowCount === 0) {
      return res.status(401).json({ success: false, message: 'Admin not found.' });
    }

    return res.json({ success: true, admin: { id: result.rows[0].id, username: result.rows[0].username } });
  } catch (err) {
    console.error('admin-login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
