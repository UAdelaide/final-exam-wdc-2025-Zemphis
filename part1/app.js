var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
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
                'INSERT INTO USERS (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['alice123', 'alice@example.com', 'hashed123', 'owner']
            );
            await connection.execute(
                'INSERT INTO USERS (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['bobwalker', 'bob@example.com', 'hashed456', 'walker']
            );
            await connection.execute(
                'INSERT INTO USERS (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['carol123', 'carol@exmample.com', 'hashed789', 'owner']
            );
            await connection.execute(
                'INSERT INTO USERS (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['a', 'a@example.com', 'a', 'walker']
            );
            await connection.execute(
                'INSERT INTO USERS (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['b', 'b@example.com', 'b', 'owner']
            );
            console.log('Initial data inserted');

            await connection.execute(
                'INSERT INTO Dogs (owner_id, name, size) VALUES (?, ?, ?)',
                [1, 'Max', 'medium']
            );
            await connection.execute(
                'INSERT INTO Dogs (owner_id, name, size) VALUES (?, ?, ?)',
                [3, 'Bella', 'small']
            );
            await connection.execute(
                'INSERT INTO Dogs (owner_id, name, size) VALUES (?, ?, ?)',
                [2, 'Bob', 'small']
            );
            await connection.execute(
                'INSERT INTO Dogs (owner_id, name, size) VALUES (?, ?, ?)',
                [4, 'Abu', 'small']
            );
            await connection.execute(
                'INSERT INTO Dogs (owner_id, name, size) VALUES (?, ?, ?)',
                [5, 'Bren', 'small']
            );
            console.log('Initial dog data inserted');

            await connection.execute(
                'INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES (?, ?, ?, ?, ?)',
                [1, '2025-06-10 08:00:00', 30, 'Parklands', 'open']
            );
            await connection.execute(
                'INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES (?, ?, ?, ?, ?)',
                [2, '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted']
            );
            await connection.execute(
                'INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES (?, ?, ?, ?, ?)',
                [3, '2025-06-10 8:00:00', 999, 'Parklands', 'open']
            );
            await connection.execute(
                'INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES (?, ?, ?, ?, ?)',
                [4, '2025-06-10 8:00:00', 999, 'Parklands', 'open']
            );
            await connection.execute(
                'INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES (?, ?, ?, ?, ?)',
                [5, '2025-06-10 8:00:00', 999, 'Parklands', 'open']
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


app.get('/api/dogs', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
            d.name AS dog_name,
            d.size,
            u.username AS owner_username
            FROM Dogs d
            JOIN Users u ON d.owner_id = u.id);
    }
});