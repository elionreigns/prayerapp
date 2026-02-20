<?php
/**
 * Lightweight JSON endpoint for the Power Prayer app shell.
 * Returns logged-in state and display name so the app can show username + green dot in the header.
 * Uses the same session as login/dashboard (URIM_THUMMIM_SESSID). No secrets returned.
 * Upload this file to your site's public_html/prayers/
 */
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, max-age=0');
header('Access-Control-Allow-Origin: ' . (isset($_SERVER['HTTP_ORIGIN']) && preg_match('/^https?:\/\/(www\.)?prayerauthority\.com$/i', $_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*'));

if (session_status() === PHP_SESSION_NONE) {
    $session_path = __DIR__ . '/sessions';
    if (!is_dir($session_path) && !mkdir($session_path, 0755, true)) {
        echo json_encode(['loggedIn' => false]);
        exit;
    }
    ini_set('session.save_path', $session_path);
    ini_set('session.use_strict_mode', 1);
    ini_set('session.cookie_httponly', 1);
    ini_set('session.gc_maxlifetime', 14400);
    ini_set('session.cookie_samesite', 'Lax');
    $is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
                (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ||
                (isset($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] === 'on');
    ini_set('session.cookie_secure', $is_https ? 1 : 0);
    ini_set('session.name', 'URIM_THUMMIM_SESSID');
    session_start();
}

if (!isset($_SESSION['user_id']) || !is_numeric($_SESSION['user_id']) || $_SESSION['user_id'] < 1) {
    echo json_encode(['loggedIn' => false]);
    exit;
}

$user_id = (int) $_SESSION['user_id'];
$username = isset($_SESSION['username']) ? (string) $_SESSION['username'] : '';
$first_name = '';

if (file_exists(__DIR__ . '/db_connect.php')) {
    include_once __DIR__ . '/db_connect.php';
    if (isset($pdo) && $pdo instanceof PDO) {
        try {
            $stmt = $pdo->prepare('SELECT first_name, last_name, username FROM users WHERE id = ?');
            $stmt->execute([$user_id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $first_name = trim($row['first_name'] ?? '');
                if ($first_name === '' && trim($row['last_name'] ?? '') !== '') {
                    $first_name = trim($row['last_name']);
                }
                if ($username === '' && !empty($row['username'])) {
                    $username = trim($row['username']);
                }
            }
        } catch (Exception $e) {
            // leave first_name empty
        }
    }
}

$display_name = $first_name !== '' ? $first_name : ($username !== '' ? $username : 'Signed in');
echo json_encode([
    'loggedIn' => true,
    'username' => $username,
    'displayName' => $display_name
], JSON_UNESCAPED_SLASHES);
