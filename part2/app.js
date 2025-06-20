const express = require('express');
const expressSession = require('express-session');
const path = require('path');
require('dotenv').config();

const pool = require('./models/db'); // Import the database pool
const app = express();

// Middleware
app.use(express.json());
app.use(express.static()

app.

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;