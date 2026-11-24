const { pool } = require('../config/db');
const { saveBase64Image, deleteUploadFile } = require('../utils/fileStorage');

// Helper to ensure general_members table exists
async function ensureGeneralMembersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS general_members (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        membership_no INT NOT NULL UNIQUE,
        name          VARCHAR(150) NOT NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('ensureGeneralMembersTable error:', err.message);
  }
}

async function getCommittee(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM committee_members ORDER BY display_order ASC, id ASC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function createCommitteeMember(req, res, next) {
  try {
    const { full_name, role, term, photo_url } = req.body;

    if (!full_name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    const savedPhoto = saveBase64Image(photo_url);

    const [result] = await pool.query(
      'INSERT INTO committee_members (full_name, role, term, photo_url) VALUES (?, ?, ?, ?)',
      [full_name.trim(), role.trim(), (term || '2026-2028').trim(), savedPhoto]
    );

    res.status(201).json({
      id: result.insertId,
      full_name: full_name.trim(),
      role: role.trim(),
      term: (term || '2026-2028').trim(),
      photo_url: savedPhoto,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteCommitteeMember(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT photo_url FROM committee_members WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].photo_url) {
      deleteUploadFile(rows[0].photo_url);
    }

    const [result] = await pool.query('DELETE FROM committee_members WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ success: true, message: 'Committee member deleted' });
  } catch (err) {
    next(err);
  }
}

async function getGeneralMembers(req, res, next) {
  try {
    await ensureGeneralMembersTable();
    const [rows] = await pool.query(
      'SELECT membership_no AS membershipNo, name FROM general_members ORDER BY membership_no ASC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function createGeneralMember(req, res, next) {
  try {
    await ensureGeneralMembersTable();
    const { name, membershipNo } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Member name is required' });
    }

    let nextNo = membershipNo ? Number(membershipNo) : null;
    if (!nextNo) {
      const [maxRow] = await pool.query('SELECT MAX(membership_no) AS maxNo FROM general_members');
      nextNo = (maxRow[0]?.maxNo || 0) + 1;
    }

    await pool.query(
      'INSERT INTO general_members (membership_no, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
      [nextNo, name.trim()]
    );

    res.status(201).json({ membershipNo: nextNo, name: name.trim() });
  } catch (err) {
    next(err);
  }
}

async function deleteGeneralMember(req, res, next) {
  try {
    await ensureGeneralMembersTable();
    const { membershipNo } = req.params;

    const [result] = await pool.query('DELETE FROM general_members WHERE membership_no = ?', [
      membershipNo,
    ]);

    res.json({ success: true, message: 'General member deleted' });
  } catch (err) {
    next(err);
  }
}

async function getBusinessMembers(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM business_members ORDER BY featured DESC, business_name ASC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCommittee,
  createCommitteeMember,
  deleteCommitteeMember,
  getGeneralMembers,
  createGeneralMember,
  deleteGeneralMember,
  getBusinessMembers,
};
