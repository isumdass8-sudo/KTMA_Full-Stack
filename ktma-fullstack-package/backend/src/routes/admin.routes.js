const router = require('express').Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const validUsers = ['admin', 'ktma', 'ktma_admin'];
  const validPasswords = ['admin', 'admin123', 'ktma2026', 'ktma@123'];

  const trimmedUser = (username || '').trim().toLowerCase();
  const trimmedPass = (password || '').trim();

  if (validUsers.includes(trimmedUser) && validPasswords.includes(trimmedPass)) {
    return res.json({
      success: true,
      token: `ktma_auth_${Date.now()}`,
      user: { username: trimmedUser, role: 'administrator' },
    });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
});

module.exports = router;
