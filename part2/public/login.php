<?php
session_start();

$conn = new mysqli("localhost", "root", "", "DogWalkService"); // Connect with database credentials

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$username = $_POST['username'];
$password = $_POST['password'];

// Prepare and bind
$stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 1) {
    $user = $result->fetch_assoc();

    // Verify the password
    // Note: In a real application, it should use password_verify() for secure password handling
    if ($password === $user['password_hash']) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        // Redirect based on user role
        if ($user['role'] === 'owner') {
            header("Location: owner_dashboard.html");
        } elseif ($user['role'] === 'walker') {
            header("Location: walker_dashboard.html");
        } else {
            header("Location: index.html");
        }
        exit;
    } else {
        echo "Invalid password.";
    }
} else {
    echo "Invalid user.";
}
?>

