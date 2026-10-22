<?php
/**
 * ONE CHATBOT - API DE PROPIEDADES (CRUD Y BÚSQUEDA)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGetProperties($db);
            break;

        case 'POST':
            handleCreateProperty($db);
            break;

        case 'PUT':
            handleUpdateProperty($db);
            break;

        case 'DELETE':
            handleDeleteProperty($db);
            break;

        default:
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
}

/**
 * Obtener lista de propiedades con filtros
 */
function handleGetProperties(PDO $db) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $code = isset($_GET['code']) ? trim($_GET['code']) : null;

    if ($id) {
        $stmt = $db->prepare("SELECT * FROM properties WHERE id = ?");
        $stmt->execute([$id]);
        $prop = $stmt->fetch();
        if (!$prop) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Propiedad no encontrada']);
            return;
        }
        echo json_encode(['status' => 'success', 'data' => formatProperty($prop)]);
        return;
    }

    if ($code) {
        $stmt = $db->prepare("SELECT * FROM properties WHERE code = ?");
        $stmt->execute([$code]);
        $prop = $stmt->fetch();
        if (!$prop) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Propiedad no encontrada']);
            return;
        }
        echo json_encode(['status' => 'success', 'data' => formatProperty($prop)]);
        return;
    }

    // Filtros opcionales
    $search = isset($_GET['q']) ? trim($_GET['q']) : '';
    $operation = isset($_GET['operation']) ? trim($_GET['operation']) : '';
    $type = isset($_GET['type']) ? trim($_GET['type']) : '';
    $zone = isset($_GET['zone']) ? trim($_GET['zone']) : '';
    $featured = isset($_GET['featured']) ? intval($_GET['featured']) : null;
    $maxPrice = isset($_GET['max_price']) ? floatval($_GET['max_price']) : 0;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;

    $where = ["status = 'Disponible'"];
    $params = [];

    if (!empty($search)) {
        $where[] = "(title LIKE ? OR description LIKE ? OR zone LIKE ? OR code LIKE ?)";
        $term = "%{$search}%";
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
    }

    if (!empty($operation)) {
        $where[] = "operation = ?";
        $params[] = $operation;
    }

    if (!empty($type)) {
        $where[] = "property_type = ?";
        $params[] = $type;
    }

    if (!empty($zone)) {
        $where[] = "zone LIKE ?";
        $params[] = "%{$zone}%";
    }

    if ($featured !== null) {
        $where[] = "is_featured = ?";
        $params[] = $featured;
    }

    if ($maxPrice > 0) {
        $where[] = "price <= ?";
        $params[] = $maxPrice;
    }

    $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
    $sql = "SELECT * FROM properties {$whereClause} ORDER BY is_featured DESC, id DESC LIMIT {$limit}";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $formatted = array_map('formatProperty', $rows);

    echo json_encode([
        'status' => 'success',
        'count' => count($formatted),
        'data' => $formatted
    ]);
}

/**
 * Crear nueva propiedad (Admin)
 */
function handleCreateProperty(PDO $db) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    if (empty($input['title']) || empty($input['price'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Título y precio son obligatorios']);
        return;
    }

    $code = !empty($input['code']) ? trim($input['code']) : 'ONE-' . rand(100, 999);
    $images = is_array($input['images'] ?? null) ? implode(',', $input['images']) : ($input['images'] ?? '');
    $features = is_array($input['features'] ?? null) ? implode(', ', $input['features']) : ($input['features'] ?? '');

    $stmt = $db->prepare("
        INSERT INTO properties 
        (code, title, operation, property_type, price, currency, city, zone, address, bedrooms, bathrooms, garages, area_sqm, description, features, images, whatsapp_agent, is_featured, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $code,
        $input['title'],
        $input['operation'] ?? 'Venta',
        $input['property_type'] ?? 'Departamento',
        floatval($input['price']),
        $input['currency'] ?? 'USD',
        $input['city'] ?? 'Santa Cruz',
        $input['zone'] ?? 'General',
        $input['address'] ?? '',
        intval($input['bedrooms'] ?? 0),
        intval($input['bathrooms'] ?? 0),
        intval($input['garages'] ?? 0),
        floatval($input['area_sqm'] ?? 0),
        $input['description'] ?? '',
        $features,
        $images,
        $input['whatsapp_agent'] ?? '+59170000000',
        intval($input['is_featured'] ?? 0),
        $input['status'] ?? 'Disponible'
    ]);

    $newId = $db->lastInsertId();
    echo json_encode([
        'status' => 'success',
        'message' => 'Propiedad creada con éxito',
        'id' => $newId,
        'code' => $code
    ]);
}

/**
 * Actualizar propiedad existente (Admin)
 */
function handleUpdateProperty(PDO $db) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = isset($_GET['id']) ? intval($_GET['id']) : ($input['id'] ?? null);

    if (!$id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID de propiedad requerido']);
        return;
    }

    $images = is_array($input['images'] ?? null) ? implode(',', $input['images']) : ($input['images'] ?? '');
    $features = is_array($input['features'] ?? null) ? implode(', ', $input['features']) : ($input['features'] ?? '');

    $stmt = $db->prepare("
        UPDATE properties SET 
        title = ?, operation = ?, property_type = ?, price = ?, currency = ?, city = ?, zone = ?, address = ?,
        bedrooms = ?, bathrooms = ?, garages = ?, area_sqm = ?, description = ?, features = ?, images = ?,
        whatsapp_agent = ?, is_featured = ?, status = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $input['title'],
        $input['operation'] ?? 'Venta',
        $input['property_type'] ?? 'Departamento',
        floatval($input['price']),
        $input['currency'] ?? 'USD',
        $input['city'] ?? 'Santa Cruz',
        $input['zone'] ?? '',
        $input['address'] ?? '',
        intval($input['bedrooms'] ?? 0),
        intval($input['bathrooms'] ?? 0),
        intval($input['garages'] ?? 0),
        floatval($input['area_sqm'] ?? 0),
        $input['description'] ?? '',
        $features,
        $images,
        $input['whatsapp_agent'] ?? '+59170000000',
        intval($input['is_featured'] ?? 0),
        $input['status'] ?? 'Disponible',
        $id
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Propiedad actualizada con éxito']);
}

/**
 * Eliminar propiedad
 */
function handleDeleteProperty(PDO $db) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID de propiedad requerido']);
        return;
    }

    $stmt = $db->prepare("DELETE FROM properties WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['status' => 'success', 'message' => 'Propiedad eliminada']);
}

/**
 * Formatear datos de propiedad para la respuesta JSON
 */
function formatProperty($p) {
    $images = !empty($p['images']) ? explode(',', $p['images']) : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'];
    $images = array_map('trim', $images);

    $features = !empty($p['features']) ? explode(',', $p['features']) : [];
    $features = array_map('trim', $features);

    return [
        'id' => (int)$p['id'],
        'code' => $p['code'],
        'title' => $p['title'],
        'operation' => $p['operation'],
        'property_type' => $p['property_type'],
        'price' => (float)$p['price'],
        'formatted_price' => '$' . number_format($p['price'], 0, '.', ',') . ' ' . $p['currency'],
        'currency' => $p['currency'],
        'city' => $p['city'],
        'zone' => $p['zone'],
        'address' => $p['address'] ?? '',
        'bedrooms' => (int)$p['bedrooms'],
        'bathrooms' => (int)$p['bathrooms'],
        'garages' => (int)$p['garages'],
        'area_sqm' => (float)$p['area_sqm'],
        'description' => $p['description'],
        'features' => $features,
        'images' => $images,
        'main_image' => $images[0] ?? '',
        'whatsapp_agent' => $p['whatsapp_agent'] ?? '+59170000000',
        'is_featured' => (bool)$p['is_featured'],
        'status' => $p['status']
    ];
}
