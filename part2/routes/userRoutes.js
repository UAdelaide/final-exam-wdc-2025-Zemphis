const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { route } = require('./walkRoutes');

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
  console.log('Login attempt', username);

  try {
    const [rows] = await db.query('SELECT * FROM Users WHERE username= ?', [username]); // Query the db to find user
    console.log('DB query complete');

    if (rows.length === 0 ) { //If no user is found
      console.log('User no found');
      return res.status(401).send('User not found');
    }

    const user = rows[0];

    if (password !== user.password_hash) { //Compare password with stored hash
      console.log('X password');
      return res.status(401).send('Invalid passowrd');
    }

    req.session.user = {  // Set the user info in session on login
      id: user.user_id,
      username: user.username,
      role: user.role
    };

    console.log('session for', req.session.user);

    if (user.role === 'owner') {
      res.redirect('/owner');
      console.log('Owner redirect');
    } else {
      res.redirect('/walker');
      console.log('Walker redirect');
    }

  } catch (err) {
    console.log('Login err');
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

route.get('/logout', (req, res) => {
  req.ses.destroy((err) => {
    if (err) {
      console.error('Logout err:', err);
      return res.status(500).send('Could not log out idk');

    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});
module.exports = router;