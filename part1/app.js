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
                'INSERT INTO Dogs (owner_id, name'
            );
    }
}