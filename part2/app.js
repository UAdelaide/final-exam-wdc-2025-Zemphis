const express = require('express');
const expressSession = require('express-session');
const path = require('path');
require('dotenv').config();

const pool = require('./models/db'); // Import the database pool
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.use(express.static(path.join(__dirname, 'public')));

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Routes
// Login route
app.post('/users/login', async (req, res) => {
    const { user, pass } = req.body;
    try {
        const [rows] = await pool.query('SELECT username, password_hash, role FROM Users WHERE username = ? AND password = ?', [user, pass]);
        if (rows.length > 0) {
            req.session.user = rows[0];
            res.json({ role: rows[0].role });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;