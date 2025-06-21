const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login
router.post('/login', async(req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM Users WHERE username = ?';
  db.get(db.query, [username], async (err, user) => {
    if (err) return res.status(500).send('Server Error');
    if (!user) return res.status(401).send('User not found');

    if (password !== user.password_hash) {
      return res.status(401).send('Invalid password');
    }
    req.session.user = {
      id: user.user_id,
      username = user.username,
      role: user.role
    };

    if (user.role === 'owner') {
      res.redirect('/owner');
    } else if (user.role === 'walker') {
      res.redirect('/walker');
    } else {
      res.status(400).send('IDK role bruh');
    }
  });
});

module.exports = router;