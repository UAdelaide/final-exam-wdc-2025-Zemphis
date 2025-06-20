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

async function insertIn