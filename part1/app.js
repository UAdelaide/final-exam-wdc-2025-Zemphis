const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const app = express();

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
        JOIN Users u ON d.owner_id = u.id;
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching dogs:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/walkrequests/open', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
        SELECT
            wr.id AS request_id,
            d.name AS dog_name,
            u.username AS owner_username,
            wr.requested_time,
            wr.duration_minutes,
            wr.location
        FROM WalkRequests wr
        JOIN Dogs d ON wr.dog_id = d.id
        JOIN Users u ON d.owner_id = u.id
        WHERE wr.status = 'open';
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching open walk requests:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/walkers/summary', async (req, res) => {
    try {
        const [walkers] = await pool.execute("SELECT user_id, username FROM Users WHERE role = 'walker'");
        const summary = [];

        for (const walker of walkers) {
            const walker_username = walker.username;
            const walker_id = walker.user_id;

            const [compltedWalks] = await pool.execute(`
                SELECT
                    COUNT(wa.request_id) AS completed_walks
                FROM
                    WalkApplications wa
                JOIN
                    WalkRequests wr ON wa.request_id = wr.id
                WHERE
                    wa.walker_id = ? AND wr.status = 'accepted' AND wa.status = 'completed';
            `, [walker_id]);
            const completed_walks = compltedWalks[0].completed_walks || 0;

            const [ratingSummary] = await pool.execute(`
                SELECT
                    AVG(wr.rating) AS average_rating,
                    COUNT(wr.rating) AS total_ratings
                FROM
                    WalkRatings wr
                WHERE
                    wa.walker_id = ?;
            `, [walker_id]);

            const average_rating = ratingSummary[0].average_rating !== null
            ? parseFloat(ratingSummary[0].average_rating) : null;
            const total_ratings = ratingSummary[0].total_ratings || 0;

            summary.push({
                walker_username,
                total_ratings,
                average_rating,
                completed_walks
            });
        }
        res.json(summary);
    } catch (error) {
        console.error('Error fetching walker summary:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

async function startApp() {
    await intialiseDatabase();
    await insertInitialData();

    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
        console.log('Test the API endpoints:');
        console.log('- http://localhost:3000/api/dogs');
        console.log('- http://localhost:3000/api/walkrequests/open');
        console.log('- http://localhost:3000/api/walkers/summary');
    });
}

startApp();