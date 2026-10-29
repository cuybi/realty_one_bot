<?php
// ponytail: single-file PHP API + CMS for SiteGround shared hosting (native PDO SQLite)
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dbPath = __DIR__ . '/../etech.db';
$db = new PDO("sqlite:" . $dbPath);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Tablas: mensajes y CMS
$db->exec("CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");

$db->exec("CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
)");

$adminPassword = getenv('ETECH_ADMIN_PASSWORD') ?: 'caromilu';
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

function isValidAuth($header, $password) {
    if (preg_match('/Bearer\s(\S+)/', $header, $matches)) {
        return hash_equals(hash('sha256', $password . '_etech_salt'), $matches[1]);
    }
    return false;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// POST /api/login
if (strpos($uri, '/api/login') !== false && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!empty($data['password']) && hash_equals($adminPassword, $data['password'])) {
        $token = hash('sha256', $adminPassword . '_etech_salt');
        echo json_encode(['token' => $token]);
        exit;
    }
    http_response_code(401);
    echo json_encode(['detail' => 'Contraseña incorrecta']);
    exit;
}

// GET /api/content (Public: carga textos e imágenes editadas)
if (strpos($uri, '/api/content') !== false && $method === 'GET') {
    $stmt = $db->query("SELECT key, value FROM site_content");
    $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    echo json_encode($rows ?: (object)[]);
    exit;
}

// POST /api/content (Protected: guarda textos y configuraciones)
if (strpos($uri, '/api/content') !== false && $method === 'POST') {
    if (!isValidAuth($authHeader, $adminPassword)) {
        http_response_code(401);
        echo json_encode(['detail' => 'No autorizado']);
        exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['detail' => 'JSON inválido']);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
    foreach ($data as $key => $val) {
        $stmt->execute([(string)$key, (string)$val]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

// POST /api/upload (Protected: subir imagen al servidor)
if (strpos($uri, '/api/upload') !== false && $method === 'POST') {
    if (!isValidAuth($authHeader, $adminPassword)) {
        http_response_code(401);
        echo json_encode(['detail' => 'No autorizado']);
        exit;
    }
    if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['detail' => 'Archivo no enviado o con error']);
        exit;
    }

    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    if (!in_array($ext, $allowed)) {
        http_response_code(400);
        echo json_encode(['detail' => 'Formato no permitido (solo jpg, png, webp, gif, svg)']);
        exit;
    }

    $uploadDir = __DIR__ . '/../images/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $filename = 'img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        $frontendDir = __DIR__ . '/../frontend/images/uploads/';
        if (is_dir($frontendDir)) {
            copy($targetPath, $frontendDir . $filename);
        }
        echo json_encode(['url' => 'images/uploads/' . $filename]);
        exit;
    }

    http_response_code(500);
    echo json_encode(['detail' => 'Error al mover archivo al servidor']);
    exit;
}

// POST /api/contact
if (strpos($uri, '/api/contact') !== false && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $message = trim($data['message'] ?? '');

    if ($name === '' || $email === '') {
        http_response_code(422);
        echo json_encode(['detail' => 'Nombre y correo requeridos']);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $phone, $message]);
    $id = $db->lastInsertId();

    echo json_encode([
        'id' => (int)$id,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'message' => $message,
        'created_at' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// GET /api/messages
if (strpos($uri, '/api/messages') !== false && $method === 'GET') {
    if (!isValidAuth($authHeader, $adminPassword)) {
        http_response_code(401);
        echo json_encode(['detail' => 'No autorizado']);
        exit;
    }
    $stmt = $db->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// DELETE /api/messages/{id}
if (preg_match('#/api/messages/(\d+)#', $uri, $matches) && $method === 'DELETE') {
    if (!isValidAuth($authHeader, $adminPassword)) {
        http_response_code(401);
        echo json_encode(['detail' => 'No autorizado']);
        exit;
    }
    $stmt = $db->prepare("DELETE FROM contact_messages WHERE id = ?");
    $stmt->execute([$matches[1]]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(404);
echo json_encode(['detail' => 'Not found']);
