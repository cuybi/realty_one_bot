<?php
/**
 * ONE CHATBOT - ENDPOINT PRINCIPAL DEL CHATBOT INMOBILIARIO IA
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/ai_config.php';

$db = getDB();
$aiSettings = getAISettings();

// Obtener datos del POST
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input) {
    $input = $_POST;
}

$sessionId = !empty($input['session_id']) ? trim($input['session_id']) : null;
$userMessage = !empty($input['message']) ? trim($input['message']) : null;
$clientLeadData = $input['lead_data'] ?? [];

if (!$sessionId) {
    $sessionId = 'sess_' . bin2hex(random_bytes(8));
}

if (!$userMessage) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'El mensaje no puede estar vacío.'
    ]);
    exit;
}

try {
    // 1. Guardar o actualizar la sesión y conversación
    $stmtConv = $db->prepare("SELECT id, message_count FROM conversations WHERE session_id = ?");
    $stmtConv->execute([$sessionId]);
    $conv = $stmtConv->fetch();

    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

    if (!$conv) {
        $stmtInsertConv = $db->prepare("INSERT INTO conversations (session_id, ip_address, user_agent, message_count) VALUES (?, ?, ?, 1)");
        $stmtInsertConv->execute([$sessionId, $ip, $ua]);
        $conversationId = $db->lastInsertId();
    } else {
        $conversationId = $conv['id'];
        $stmtUpConv = $db->prepare("UPDATE conversations SET message_count = message_count + 1, last_message_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmtUpConv->execute([$conversationId]);
    }

    // 2. Guardar mensaje del usuario
    $stmtMsg = $db->prepare("INSERT INTO messages (session_id, sender, message_text) VALUES (?, 'user', ?)");
    $stmtMsg->execute([$sessionId, $userMessage]);

    // 3. Extraer contexto de propiedades relevantes desde la base de datos
    $relevantProperties = findMatchingProperties($db, $userMessage);

    // 4. Obtener historial reciente de mensajes
    $stmtHist = $db->prepare("SELECT sender, message_text FROM messages WHERE session_id = ? ORDER BY id ASC LIMIT 10");
    $stmtHist->execute([$sessionId]);
    $messagesHistory = $stmtHist->fetchAll();

    // 5. Ejecutar la IA según proveedor configurado
    $systemPrompt = getSystemPrompt($aiSettings['agency_name'], $aiSettings['bot_name'], $relevantProperties);
    $botResponseText = null;

    if ($aiSettings['ai_provider'] === 'openai' && !empty($aiSettings['openai_api_key'])) {
        $botResponseText = callOpenAI($aiSettings['openai_api_key'], $aiSettings['ai_model'], $systemPrompt, $messagesHistory, $userMessage);
    } elseif ($aiSettings['ai_provider'] === 'gemini' && !empty($aiSettings['gemini_api_key'])) {
        $botResponseText = callGemini($aiSettings['gemini_api_key'], $aiSettings['ai_model'], $systemPrompt, $messagesHistory, $userMessage);
    }

    // Si falló la API externa o está en modo local, usar el motor heurístico local inteligente
    if (empty($botResponseText)) {
        $botResponseText = generateLocalRealEstateResponse($userMessage, $relevantProperties, $aiSettings['bot_name'], $aiSettings['agency_name']);
    }

    // 6. Detectar propiedades recomendadas en la respuesta ([ONE-101], etc.)
    $matchedProperties = extractPropertiesFromResponse($db, $botResponseText, $relevantProperties);

    // 7. Extraer y actualizar datos de Lead automáticamente (Lead Extraction & Scoring)
    $leadData = processAndSaveLead($db, $sessionId, $userMessage, $clientLeadData, $matchedProperties);

    // 8. Guardar mensaje de respuesta del Bot
    $stmtBotMsg = $db->prepare("INSERT INTO messages (session_id, sender, message_text, payload_json) VALUES (?, 'bot', ?, ?)");
    $payloadJson = !empty($matchedProperties) ? json_encode($matchedProperties, JSON_UNESCAPED_UNICODE) : null;
    $stmtBotMsg->execute([$sessionId, $botResponseText, $payloadJson]);

    // 9. Generar opciones de respuesta rápida (Quick Replies)
    $quickReplies = generateQuickReplies($userMessage, $matchedProperties);

    // 10. Devolver respuesta enriquecida al frontend
    echo json_encode([
        'status' => 'success',
        'session_id' => $sessionId,
        'message' => $botResponseText,
        'properties' => $matchedProperties,
        'quick_replies' => $quickReplies,
        'lead' => $leadData,
        'provider' => $aiSettings['ai_provider']
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al procesar mensaje: ' . $e->getMessage()
    ]);
}

/**
 * Buscar propiedades en DB según palabras clave del usuario
 */
function findMatchingProperties(PDO $db, $userMessage) {
    $msg = mb_strtolower($userMessage, 'UTF-8');
    $conditions = ["status = 'Disponible'"];
    $params = [];

    // Filtro por tipo de propiedad
    if (preg_match('/(casa|residencia|chalet)/i', $msg)) {
        $conditions[] = "property_type = 'Casa'";
    } elseif (preg_match('/(departamento|depto|dpto|piso|monoambiente|estudio)/i', $msg)) {
        $conditions[] = "property_type IN ('Departamento', 'Penthouse')";
    } elseif (preg_match('/(terreno|lote)/i', $msg)) {
        $conditions[] = "property_type = 'Terreno'";
    } elseif (preg_match('/(penthouse)/i', $msg)) {
        $conditions[] = "property_type = 'Penthouse'";
    }

    // Filtro por operación
    if (preg_match('/(alquilar|alquiler|rentar|renta)/i', $msg)) {
        $conditions[] = "operation = 'Alquiler'";
    } elseif (preg_match('/(comprar|compra|venta|inversion)/i', $msg)) {
        $conditions[] = "operation = 'Venta'";
    }

    // Filtro por zona
    if (preg_match('/(urubo|urubó)/i', $msg)) {
        $conditions[] = "zone LIKE '%Urubó%'";
    } elseif (preg_match('/(equipetrol)/i', $msg)) {
        $conditions[] = "zone LIKE '%Equipetrol%'";
    } elseif (preg_match('/(sirari)/i', $msg)) {
        $conditions[] = "zone LIKE '%Sirari%'";
    } elseif (preg_match('/(las palmas)/i', $msg)) {
        $conditions[] = "zone LIKE '%Las Palmas%'";
    }

    $whereClause = implode(" AND ", $conditions);
    $sql = "SELECT * FROM properties WHERE {$whereClause} ORDER BY is_featured DESC, id DESC LIMIT 6";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll();

    // Si no hay resultados específicos, traer las más destacadas
    if (empty($results)) {
        $stmtDefault = $db->query("SELECT * FROM properties WHERE status = 'Disponible' ORDER BY is_featured DESC, id DESC LIMIT 4");
        $results = $stmtDefault->fetchAll();
    }

    return $results;
}

/**
 * Extraer objetos de propiedades si se mencionan códigos en el texto
 */
function extractPropertiesFromResponse(PDO $db, $responseText, $contextProps) {
    preg_match_all('/\[([A-Z0-9\-]+)\]/', $responseText, $matches);
    $codes = !empty($matches[1]) ? array_unique($matches[1]) : [];

    $properties = [];
    if (!empty($codes)) {
        $placeholders = str_repeat('?,', count($codes) - 1) . '?';
        $stmt = $db->prepare("SELECT * FROM properties WHERE code IN ($placeholders)");
        $stmt->execute(array_values($codes));
        $rows = $stmt->fetchAll();

        foreach ($rows as $row) {
            $imgs = !empty($row['images']) ? explode(',', $row['images']) : [];
            $properties[] = [
                'id' => (int)$row['id'],
                'code' => $row['code'],
                'title' => $row['title'],
                'operation' => $row['operation'],
                'property_type' => $row['property_type'],
                'price' => (float)$row['price'],
                'formatted_price' => '$' . number_format($row['price'], 0, '.', ',') . ' ' . $row['currency'],
                'currency' => $row['currency'],
                'zone' => $row['zone'],
                'bedrooms' => (int)$row['bedrooms'],
                'bathrooms' => (int)$row['bathrooms'],
                'area_sqm' => (float)$row['area_sqm'],
                'main_image' => trim($imgs[0] ?? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'),
                'whatsapp_agent' => $row['whatsapp_agent'] ?? '+59170000000'
            ];
        }
    }

    // Si no hay códigos explícitos pero hubo búsqueda directa de casas/dptos, retornar las 2 mejores
    if (empty($properties) && count($contextProps) <= 2 && !empty($contextProps)) {
        foreach ($contextProps as $row) {
            $imgs = !empty($row['images']) ? explode(',', $row['images']) : [];
            $properties[] = [
                'id' => (int)$row['id'],
                'code' => $row['code'],
                'title' => $row['title'],
                'operation' => $row['operation'],
                'property_type' => $row['property_type'],
                'price' => (float)$row['price'],
                'formatted_price' => '$' . number_format($row['price'], 0, '.', ',') . ' ' . $row['currency'],
                'currency' => $row['currency'],
                'zone' => $row['zone'],
                'bedrooms' => (int)$row['bedrooms'],
                'bathrooms' => (int)$row['bathrooms'],
                'area_sqm' => (float)$row['area_sqm'],
                'main_image' => trim($imgs[0] ?? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'),
                'whatsapp_agent' => $row['whatsapp_agent'] ?? '+59170000000'
            ];
        }
    }

    return $properties;
}

/**
 * Extraer y actualizar datos del prospecto (Lead Extraction)
 */
function processAndSaveLead(PDO $db, $sessionId, $userMessage, $clientData, $matchedProperties) {
    // 1. Verificar si ya existe el lead
    $stmtLead = $db->prepare("SELECT * FROM leads WHERE session_id = ?");
    $stmtLead->execute([$sessionId]);
    $lead = $stmtLead->fetch();

    $phone = $clientData['phone'] ?? ($lead['phone'] ?? null);
    $fullName = $clientData['full_name'] ?? ($lead['full_name'] ?? null);
    $email = $clientData['email'] ?? ($lead['email'] ?? null);
    $leadScore = $lead ? (int)$lead['lead_score'] : 10;
    $status = $lead ? $lead['status'] : 'Nuevo';

    // Detección de teléfono en el mensaje: ej. 70012345 o +59170012345
    if (preg_match('/(\+?[0-9]{7,14})/', $userMessage, $pMatches)) {
        $phone = $pMatches[1];
        $leadScore += 35;
        $status = 'Calificado';
    }

    // Detección de email
    if (preg_match('/([a-zA-Z0-9_\.\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\.]+)/', $userMessage, $eMatches)) {
        $email = $eMatches[1];
        $leadScore += 20;
    }

    // Detección de nombre
    if (preg_match('/(?:me llamo|mi nombre es|soy)\s+([A-Za-zÀ-ÿ]{3,20}(?:\s+[A-Za-zÀ-ÿ]{3,20})?)/i', $userMessage, $nMatches)) {
        $fullName = trim($nMatches[1]);
        $leadScore += 15;
    }

    // Detección de interés en propiedades
    $lastPropViewed = $lead['last_property_viewed'] ?? null;
    if (!empty($matchedProperties)) {
        $lastPropViewed = $matchedProperties[0]['code'] . ' - ' . $matchedProperties[0]['title'];
        $leadScore += 10;
    }

    // Normalizar score máximo a 100
    $leadScore = min($leadScore, 100);

    if ($lead) {
        $stmtUp = $db->prepare("
            UPDATE leads SET 
            full_name = COALESCE(?, full_name),
            phone = COALESCE(?, phone),
            email = COALESCE(?, email),
            lead_score = ?,
            status = ?,
            last_property_viewed = COALESCE(?, last_property_viewed),
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        $stmtUp->execute([$fullName, $phone, $email, $leadScore, $status, $lastPropViewed, $lead['id']]);
        $leadId = $lead['id'];
    } else {
        $stmtIn = $db->prepare("
            INSERT INTO leads (session_id, full_name, phone, email, lead_score, status, last_property_viewed)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmtIn->execute([$sessionId, $fullName, $phone, $email, $leadScore, $status, $lastPropViewed]);
        $leadId = $db->lastInsertId();
    }

    // Vincular lead_id a la conversación
    $stmtLink = $db->prepare("UPDATE conversations SET lead_id = ? WHERE session_id = ?");
    $stmtLink->execute([$leadId, $sessionId]);

    return [
        'id' => $leadId,
        'full_name' => $fullName,
        'phone' => $phone,
        'email' => $email,
        'score' => $leadScore,
        'status' => $status
    ];
}

/**
 * Generar sugerencias interactivas (Quick Replies)
 */
function generateQuickReplies($userMessage, $matchedProperties) {
    if (!empty($matchedProperties)) {
        return [
            ['text' => '📅 Agendar visita presencial', 'action' => 'schedule_visit'],
            ['text' => '💬 Contactar por WhatsApp', 'action' => 'whatsapp_agent'],
            ['text' => '💰 Ver opciones de menor precio', 'action' => 'lower_price'],
            ['text' => '🔍 Buscar en otra zona', 'action' => 'other_zone']
        ];
    }

    return [
        ['text' => '🏡 Casas en Urubó', 'action' => 'search_houses_urubo'],
        ['text' => '🏢 Departamentos en Equipetrol', 'action' => 'search_dpto_equipetrol'],
        ['text' => '🔑 Opciones en Alquiler', 'action' => 'search_rent'],
        ['text' => '📈 Oportunidades de Inversión', 'action' => 'search_investment']
    ];
}
