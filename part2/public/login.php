<?php
session_start();

$conn = new mysqli("localhost", "root", "", "DogWalkService"); // Connect with database credentials

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

