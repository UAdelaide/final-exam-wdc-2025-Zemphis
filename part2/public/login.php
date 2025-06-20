<?php
session_start();

$conn = new mysqli("localhost", "root", "", "DogWalkService"); // Connect with database credentials

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$username = $_POST['username'];
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");