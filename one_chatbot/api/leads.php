<?php
/**
 * ONE CHATBOT - API DE LEADS / PROSPECTOS (CRM Y MÉTRICAS)
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
            if (isset($_GET['export']) && $_GET['export'] === 'csv') {
                exportLeadsToCsv($db);
            } elseif (isset($_GET['stats'])) {
                handleGetStats($db);
            } else {
                handleGetLeads($db);
            }
            break;

        case 'POST':
        case 'PUT':
            handleUpdateLead($db);
            break;

        case 'DELETE':
            handleDeleteLead($db);
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
 * Obtener estadísticas / KPIs del CRM
 */
function handleGetStats(PDO $db) {
    $totalLeads = (int)$db->query("SELECT COUNT(*) FROM leads")->fetchColumn();
    $todayLeads = (int)$db->query("SELECT COUNT(*) FROM leads WHERE DATE(created_at) = CURRENT_DATE")->fetchColumn();
    $qualifiedLeads = (int)$db->query("SELECT COUNT(*) FROM leads WHERE lead_score >= 45")->fetchColumn();
    $scheduledVisits = (int)$db->query("SELECT COUNT(*) FROM leads WHERE status = 'Visita Agendada'")->fetchColumn();
    $totalProperties = (int)$db->query("SELECT COUNT(*) FROM properties WHERE status = 'Disponible'")->fetchColumn();
    $totalMessages = (int)$db->query("SELECT COUNT(*) FROM messages")->fetchColumn();

    echo json_encode([
        'status' => 'success',
        'stats' => [
            'total_leads' => $totalLeads,
            'today_leads' => $todayLeads,
            'qualified_leads' => $qualifiedLeads,
            'scheduled_visits' => $scheduledVisits,
            'total_properties' => $totalProperties,
            'total_messages' => $totalMessages
        ]
    ]);
}

/**
 * Obtener lista de leads con filtros o detalle individual con mensajes
 */
function handleGetLeads(PDO $db) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;

    if ($id) {
        $stmt = $db->prepare("SELECT * FROM leads WHERE id = ?");
        $stmt->execute([$id]);
        $lead = $stmt->fetch();

        if (!$lead) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Lead no encontrado']);
            return;
        }

        // Obtener historial de mensajes de la sesión del lead
        $stmtMsgs = $db->prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY id ASC");
        $stmtMsgs->execute([$lead['session_id']]);
        $messages = $stmtMsgs->fetchAll();

        echo json_encode([
            'status' => 'success',
            'data' => [
                'lead' => $lead,
                'messages' => $messages
            ]
        ]);
        return;
    }

    $status = isset($_GET['status']) ? trim($_GET['status']) : '';
    $search = isset($_GET['q']) ? trim($_GET['q']) : '';
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 100;

    $where = [];
    $params = [];

    if (!empty($status)) {
        $where[] = "status = ?";
        $params[] = $status;
    }

    if (!empty($search)) {
        $where[] = "(full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR notes LIKE ?)";
        $term = "%{$search}%";
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
    }

    $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
    $sql = "SELECT * FROM leads {$whereClause} ORDER BY id DESC LIMIT {$limit}";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $leads = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'count' => count($leads),
        'data' => $leads
    ]);
}

/**
 * Actualizar estado y notas de un lead
 */
function handleUpdateLead(PDO $db) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $id = isset($_GET['id']) ? intval($_GET['id']) : ($input['id'] ?? null);

    if (!$id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID de lead requerido']);
        return;
    }

    $fields = [];
    $params = [];

    if (isset($input['status'])) {
        $fields[] = "status = ?";
        $params[] = $input['status'];
    }

    if (isset($input['notes'])) {
        $fields[] = "notes = ?";
        $params[] = $input['notes'];
    }

    if (isset($input['full_name'])) {
        $fields[] = "full_name = ?";
        $params[] = $input['full_name'];
    }

    if (isset($input['phone'])) {
        $fields[] = "phone = ?";
        $params[] = $input['phone'];
    }

    if (isset($input['lead_score'])) {
        $fields[] = "lead_score = ?";
        $params[] = intval($input['lead_score']);
    }

    if (empty($fields)) {
        echo json_encode(['status' => 'success', 'message' => 'Sin cambios']);
        return;
    }

    $params[] = $id;
    $sql = "UPDATE leads SET " . implode(", ", $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['status' => 'success', 'message' => 'Lead actualizado']);
}

/**
 * Eliminar un lead
 */
function handleDeleteLead(PDO $db) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID de lead requerido']);
        return;
    }

    $stmt = $db->prepare("DELETE FROM leads WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['status' => 'success', 'message' => 'Lead eliminado']);
}

/**
 * Exportar Leads a archivo CSV para Excel
 */
function exportLeadsToCsv(PDO $db) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="leads_one_chatbot_' . date('Y-m-d_His') . '.csv"');

    $output = fopen('php://output', 'w');
    // BOM para compatibilidad con Microsoft Excel en español
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    fputcsv($output, ['ID', 'Nombre', 'Teléfono', 'Email', 'Puntaje Lead', 'Estado', 'Último Inmueble Visto', 'Notas', 'Fecha de Registro']);

    $stmt = $db->query("SELECT id, full_name, phone, email, lead_score, status, last_property_viewed, notes, created_at FROM leads ORDER BY id DESC");
    while ($row = $stmt->fetch()) {
        fputcsv($output, [
            $row['id'],
            $row['full_name'] ?: 'No indicado',
            $row['phone'] ?: 'No indicado',
            $row['email'] ?: 'No indicado',
            $row['lead_score'] . '/100',
            $row['status'],
            $row['last_property_viewed'] ?: '-',
            $row['notes'] ?: '-',
            $row['created_at']
        ]);
    }

    fclose($output);
    exit;
}
