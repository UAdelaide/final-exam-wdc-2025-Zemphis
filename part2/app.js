const express = require('express');
const mysql = require('mysql2/promise'); // Using mysql2/promise for async/await support
const session = require('express-session'); // Using express-session for session management
const bodyParser = require('body-parser'); // Using body-parser for parsing request bodies
const path = require('path');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
let pool;

async function intialiseDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Database connection pool created');

        await pool.getConnection();
        console.log('Connected to database');
    } catch (error) {
        console.error('Failed to connect to database');
        process.exit(1);
    }
}

async function insertInitialData() {
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            await connection.execute('DELETE FROM WalkRatings');
            await connection.execute('DELETE FROM WalkApplications');
            await connection.execute('DELETE FROM WalkRequests');
            await connection.execute('DELETE FROM Dogs');
            await connection.execute('DELETE FROM Users');
            console.log('Database tables cleared');

            await connection.execute(
                'INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['alice123', 'alice@example.com', 'hashed123', 'owner']
            );
            await connection.execute(
                'INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['bobwalker', 'bob@example.com', 'hashed456', 'walker']
            );
            await connection.execute(
                'INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['carol123', 'carol@exmample.com', 'hashed789', 'owner']
            );
            await connection.execute(
                'INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['a', 'a@example.com', 'a', 'walker']
            );
            await connection.execute(
                'INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['b', 'b@example.com', 'b', 'owner']
            );
            console.log('Initial data inserted');

            const [alice] = await connection.execute('SELECT user_id FROM Users WHERE username = ?', ['alice123']);
            const aliceId = alice.length > 0 ? alice[0].user_id : null;
            const [bob] = await connection.execute('SELECT user_id FROM Users WHERE username = ?', ['bobwalker']);
            const bobId = bob.length > 0 ? bob[0].user_id : null;
            const [carol] = await connection.execute('SELECT user_id FROM Users WHERE username = ?', ['carol123']);
            const carolId = carol.length > 0 ? carol[0].user_id : null;
            const [a] = await connection.execute('SELECT user_id FROM Users WHERE username = ?', ['a']);
            const aId = a.length > 0 ? a[0].user_id : null;
            const [b] = await connection.execute('SELECT user_id FROM Users WHERE username = ?', ['b']);
            const bId = b.length > 0 ? b[0].user_id : null;

            await connection.execute(
                'INSERT INTO Dogs (owner_id, name, size) VALUES (?, ?, ?)',
                [aliceId, 'Max', 'medium']
            );
            await connection.execute(
                'INSERT INTO Dogs (owner_id, name, size) VALUES (?, ?, ?)',
                [carolId, 'Bella', 'small']
            );
            await connection.execute(
                'INSERT INTO Dogs (owner_id, name, size) VALUES (?, ?, ?)',
                [bobId, 'Bob', 'small']
            );
            await connection.execute(
                'INSERT INTO Dogs (owner_id, name, size) VALUES (?, ?, ?)',
                [aId, 'Abu', 'small']
            );
            await connection.execute(
                'INSERT INTO Dogs (owner_id, name, size) VALUES (?, ?, ?)',
                [bId, 'Bren', 'small']
            );
            console.log('Initial dog data inserted');

            const [max] = await connection.execute('SELECT dog_id FROM Dogs WHERE name = ?', ['Max']);
            const maxId = max.length > 0 ? max[0].dog_id : null;
            const [bella] = await connection.execute('SELECT dog_id FROM Dogs WHERE name = ?', ['Bella']);
            const bellaId = bella.length > 0 ? bella[0].dog_id : null;
            const [bobDog] = await connection.execute('SELECT dog_id FROM Dogs WHERE name = ?', ['Bob']);
            const bobDogId = bobDog.length > 0 ? bobDog[0].dog_id : null;
            const [abu] = await connection.execute('SELECT dog_id FROM Dogs WHERE name = ?', ['Abu']);
            const abuId = abu.length > 0 ? abu[0].dog_id : null;
            const [bren] = await connection.execute('SELECT dog_id FROM Dogs WHERE name = ?', ['Bren']);
            const brenId = bren.length > 0 ? bren[0].dog_id : null;

            await connection.execute(
                'INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES (?, ?, ?, ?, ?)',
                [maxId, '2025-06-10 08:00:00', 30, 'Parklands', 'open']
            );
            await connection.execute(
                'INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES (?, ?, ?, ?, ?)',
                [bellaId, '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted']
            );
            await connection.execute(
                'INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES (?, ?, ?, ?, ?)',
                [bobDogId, '2025-06-10 8:00:00', 999, 'Parklands', 'open']
            );
            await connection.execute(
                'INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES (?, ?, ?, ?, ?)',
                [abuId, '2025-06-10 8:00:00', 999, 'Parklands', 'open']
            );
            await connection.execute(
                'INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES (?, ?, ?, ?, ?)',
                [brenId, '2025-06-10 8:00:00', 999, 'Parklands', 'open']
            );
            console.log('Initial walk requests inserted');

            await connection.commit();
            console.log('Database initialised');

        } catch (error) {
            await connection.rollback();
            console.error('Error inserting initial data:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    } catch (error) {
        console.error('Error during database initialisation:', error);
    }
}



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