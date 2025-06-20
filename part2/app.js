const express = require('express');
const mysql = require('mysql2/promise'); // Using mysql2/promise for async/await support
const session = require('express-session'); // Using express-session for session management
const path = require('path');
require('dotenv').config();

const app = express();



// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;