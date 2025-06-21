const express = require('express');
const path = require('path');
const session = require('express-session'); // Managing user sessions
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true})); //
app.use(express.static(path.join(__dirname, '/public')));

app.use(session({ //
    secret: 'test',
    resave: false,
    saveUninitialized: false
}));


// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

//Redirect
app.get('/owner', (req, res) => {
    if (req.session.user && req.session.user.role === 'owner') {
        res.sendFile(path.join(__dirname, 'public', 'owner-dashboard.html'));
    } else {
        res.redirect('/');
    }
});
app.get('/walker', (req, res) => {
    if (req.session.user && req.session.user.role === 'walker') {
        res.sendFile(path.join(__dirname, 'public', 'walker-dashboard.html'));
    } else {
        res.redirect('/');
    }
});


// Export the app instead of listening here
module.exports = app;