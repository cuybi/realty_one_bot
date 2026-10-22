<?php
/**
 * Urubó Green Park CMS - Persistence Layer
 * Saves CMS data to cms_data.json
 */

header('Content-Type: application/json');

// Security: Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Get the raw POST data
$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

// Security: Basic password validation
// This should match the password in admin.html
$adminPass = $data['password'] ?? '';
if ($adminPass !== 'urubo2026') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Extract the CMS data
$cmsData = $data['cms_data'] ?? null;

if (!$cmsData) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing CMS content']);
    exit;
}

// Save to cms_data.json
$filePath = 'cms_data.json';
$jsonContent = json_encode($cmsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if (file_put_contents($filePath, $jsonContent)) {
    echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error writing to file. Check folder permissions.']);
}
?>
