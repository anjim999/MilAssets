const authService = require('../services/authService');

/**
 * POST /api/auth/login
 */
function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const result = authService.login(username, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

/**
 * GET /api/auth/me
 */
function getProfile(req, res) {
  try {
    const user = authService.getProfile(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

module.exports = { login, getProfile };
