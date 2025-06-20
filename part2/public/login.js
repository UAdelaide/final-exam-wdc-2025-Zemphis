const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');

const app = express();
// Middleware
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database