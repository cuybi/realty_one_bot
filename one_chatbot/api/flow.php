<?php
/**
 * ONE CHATBOT - MOTOR DE FLUJO FACEBOOK -> WHATSAPP -> FORMULARIO -> AGENDAR VISITA
 * Implementa exactamente el diagrama de flujo oficial.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';
$db = getDB();

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: $_POST;

$action = $_GET['action'] ?? ($input['action'] ?? 'process');
$sessionId = $input['session_id'] ?? ($_GET['session_id'] ?? 'sess_' . bin2hex(random_bytes(8)));
$adSource = $input['ad_source'] ?? ($_GET['ad_source'] ?? 'Publicación Facebook #1');

try {
    switch ($action) {
        // 1. Mensaje inicial de bienvenida al pulsar el botón de WhatsApp
        case 'welcome':
            handleWelcome($db, $sessionId, $adSource);
            break;

        // 2. Envío del Formulario en Línea (Nombre, Celular, Email, Agendar Visita)
        case 'submit_form':
            handleSubmitForm($db, $sessionId, $input, $adSource);
            break;

        // 3. Recordatorio si no ha completado el formulario
        case 'reminder':
            handleReminder($db, $sessionId);
            break;

        // 4. Procesar mensaje de chat paso a paso
        case 'chat_step':
            handleChatStep($db, $sessionId, $input);
            break;

        default:
            handleWelcome($db, $sessionId, $adSource);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en flujo: ' . $e->getMessage()
    ]);
}

/**
 * 1. Bienvenida y solicitud de formulario
 */
function handleWelcome(PDO $db, $sessionId, $adSource) {
    $agencyName = "Realty ONE Group Bolivia";
    $welcomeText = "¡Hola! 👋 Te damos la más cordial bienvenida a {$agencyName}. Vimos que vienes desde nuestro anuncio ({$adSource}).";
    $formRequestText = "Para empezar y asignarte a un asesor especializado, por favor completa tu registro y selecciona el día y hora para tu visita:";

    // Guardar o iniciar conversación
    $stmt = $db->prepare("INSERT INTO conversations (session_id, ip_address, user_agent, message_count) VALUES (?, ?, ?, 2) ON DUPLICATE KEY UPDATE message_count = message_count + 1");
    try {
        $stmt->execute([$sessionId, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1', $_SERVER['HTTP_USER_AGENT'] ?? 'WhatsApp Web']);
    } catch (Exception $e) {
        // SQLite fallback handling
    }

    // Registrar mensaje bot
    saveMessage($db, $sessionId, 'bot', $welcomeText . "\n\n" . $formRequestText);

    echo json_encode([
        'status' => 'success',
        'session_id' => $sessionId,
        'step' => 'awaiting_form',
        'messages' => [
            ['sender' => 'bot', 'text' => $welcomeText],
            ['sender' => 'bot', 'text' => $formRequestText]
        ],
        'requires_form' => true,
        'form_fields' => [
            'full_name' => 'Nombre y Apellido',
            'phone' => 'Número de Celular / WhatsApp',
            'email' => 'Correo Electrónico',
            'visit_date' => 'Día de Visita (Lunes a Sábado)',
            'visit_time' => 'Hora (10:00 AM, 2:00 PM, 4:00 PM, 6:00 PM)'
        ]
    ]);
}

/**
 * 2. Guardar formulario completado y generar confirmación + aviso de agente + link web + despedida
 */
function handleSubmitForm(PDO $db, $sessionId, $input, $adSource) {
    $fullName = trim($input['full_name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $email = trim($input['email'] ?? '');
    $visitDate = trim($input['visit_date'] ?? 'Lunes');
    $visitTime = trim($input['visit_time'] ?? '10:00 AM');
    $propertyInterest = trim($input['property_interest'] ?? 'Propiedad del Anuncio');

    if (empty($fullName) || empty($phone)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Nombre y número de celular son obligatorios']);
        return;
    }

    // Guardar o actualizar en la tabla leads
    $stmtLead = $db->prepare("
        INSERT INTO leads 
        (session_id, full_name, phone, email, visit_date, visit_time, ad_source, form_completed, lead_score, status, last_property_viewed)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, 95, 'Visita Agendada', ?)
        ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name),
        phone = VALUES(phone),
        email = VALUES(email),
        visit_date = VALUES(visit_date),
        visit_time = VALUES(visit_time),
        form_completed = 1,
        lead_score = 95,
        status = 'Visita Agendada',
        last_property_viewed = VALUES(last_property_viewed),
        updated_at = CURRENT_TIMESTAMP
    ");

    try {
        $stmtLead->execute([$sessionId, $fullName, $phone, $email, $visitDate, $visitTime, $adSource, $propertyInterest]);
    } catch (Exception $e) {
        // Fallback SQLite insert / replace
        $db->exec("DELETE FROM leads WHERE session_id = " . $db->quote($sessionId));
        $stmtSqlite = $db->prepare("
            INSERT INTO leads (session_id, full_name, phone, email, visit_date, visit_time, ad_source, form_completed, lead_score, status, last_property_viewed)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, 95, 'Visita Agendada', ?)
        ");
        $stmtSqlite->execute([$sessionId, $fullName, $phone, $email, $visitDate, $visitTime, $adSource, $propertyInterest]);
    }

    // Secuencia de respuestas oficiales del diagrama:
    // 1. Confirmación
    $msgConfirmation = "✅ ¡Gracias, {$fullName}! Su formulario fue enviado con éxito.\n¡Recibido! Todos tus datos han sido registrados y tu visita está agendada para el *{$visitDate} a las {$visitTime}*.";
    
    // 2. Aviso de Agente
    $msgAgent = "🎧 *Aviso:* En breve, uno de nuestros agentes especializados se pondrá en contacto contigo para reconfirmar la dirección exacta y detalles.";

    // 3. Más Opciones / Sitio Web
    $msgWebsite = "🌐 Mientras tanto, puedes explorar todo nuestro catálogo de casas, departamentos y terrenos aquí:\n👉 https://realyonegroupbolivia.e-techgroupbolivia.com";

    // 4. Despedida Cordial
    $msgGoodbye = "👋 ¡Muchas gracias por tu confianza! Que tengas un excelente día. ¡Estamos a tu servicio!";

    // Guardar mensajes en la base de datos
    saveMessage($db, $sessionId, 'bot', $msgConfirmation);
    saveMessage($db, $sessionId, 'bot', $msgAgent);
    saveMessage($db, $sessionId, 'bot', $msgWebsite);
    saveMessage($db, $sessionId, 'bot', $msgGoodbye);

    echo json_encode([
        'status' => 'success',
        'step' => 'completed',
        'lead' => [
            'full_name' => $fullName,
            'phone' => $phone,
            'email' => $email,
            'visit_date' => $visitDate,
            'visit_time' => $visitTime,
            'status' => 'Visita Agendada'
        ],
        'sequence' => [
            ['type' => 'confirmation', 'text' => $msgConfirmation],
            ['type' => 'agent_notice', 'text' => $msgAgent],
            ['type' => 'website_link', 'text' => $msgWebsite, 'url' => 'index.html'],
            ['type' => 'goodbye', 'text' => $msgGoodbye]
        ]
    ]);
}

/**
 * 3. Recordatorio si no envió el formulario
 */
function handleReminder(PDO $db, $sessionId) {
    $reminderText = "🔔 *Recordatorio:* Notamos que aún no has completado tu formulario. Para no perder tu cupo de visita y recibir la ficha técnica completa, por favor completa tus datos:";
    saveMessage($db, $sessionId, 'bot', $reminderText);

    echo json_encode([
        'status' => 'success',
        'step' => 'reminder_sent',
        'message' => $reminderText,
        'requires_form' => true
    ]);
}

/**
 * 4. Procesar mensaje del chat exigiendo formulario
 */
function handleChatStep(PDO $db, $sessionId, $input) {
    $value = trim($input['value'] ?? '');
    saveMessage($db, $sessionId, 'user', $value);

    // Verificar si el lead ya completó el formulario
    $stmt = $db->prepare("SELECT form_completed FROM leads WHERE session_id = ?");
    $stmt->execute([$sessionId]);
    $lead = $stmt->fetch();

    if ($lead && $lead['form_completed']) {
        $response = "Tu visita ya está registrada. Un asesor especializado se comunicará contigo a la brevedad.";
        saveMessage($db, $sessionId, 'bot', $response);
        echo json_encode([
            'status' => 'success',
            'response' => $response,
            'is_finished' => true
        ]);
        return;
    }

    // Si no ha completado el formulario, exigir llenarlo
    $response = "🔔 Por favor, primero llena el formulario de registro para poder asignarte a un asesor y agendar tu visita con éxito. ¡Muchas gracias! 🙏";
    saveMessage($db, $sessionId, 'bot', $response);

    echo json_encode([
        'status' => 'success',
        'requires_form' => true,
        'response' => $response
    ]);
}

function saveMessage(PDO $db, $sessionId, $sender, $text) {
    try {
        $stmt = $db->prepare("INSERT INTO messages (session_id, sender, message_text) VALUES (?, ?, ?)");
        $stmt->execute([$sessionId, $sender, $text]);
    } catch (Exception $e) {
        // Ignorar en caso de error no crítico
    }
}
