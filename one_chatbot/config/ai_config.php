<?php
/**
 * ONE CHATBOT - CONFIGURACIÓN DE INTELIGENCIA ARTIFICIAL
 * Asistente experto en Bienes Raíces (OpenAI / Gemini / Motor Inteligente Local)
 */

require_once __DIR__ . '/db.php';

/**
 * Obtener configuración de IA desde la base de datos o variables de entorno
 */
function getAISettings() {
    $db = getDB();
    $settings = [
        'ai_provider'    => 'local', // 'openai', 'gemini', 'local'
        'openai_api_key' => getenv('OPENAI_API_KEY') ?: '',
        'gemini_api_key' => getenv('GEMINI_API_KEY') ?: '',
        'ai_model'       => 'gpt-4o-mini',
        'bot_name'       => 'Valeria',
        'agency_name'    => 'Realty ONE Group Bolivia',
        'whatsapp'       => '+59170000000',
    ];

    try {
        $stmt = $db->query("SELECT setting_key, setting_value FROM settings");
        while ($row = $stmt->fetch()) {
            if (isset($settings[$row['setting_key']]) && !empty($row['setting_value'])) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
        }
    } catch (Exception $e) {
        // En caso de error, usar defaults
    }

    // Si hay OpenAI API key definida, priorizar OpenAI
    if (!empty($settings['openai_api_key']) && $settings['ai_provider'] === 'local') {
        $settings['ai_provider'] = 'openai';
    } elseif (!empty($settings['gemini_api_key']) && $settings['ai_provider'] === 'local') {
        $settings['ai_provider'] = 'gemini';
    }

    return $settings;
}

/**
 * Generar el Prompt del Sistema para el Asesor Inmobiliario
 */
function getSystemPrompt($agencyName, $botName, $propertiesContext = []) {
    $propListText = "";
    if (!empty($propertiesContext)) {
        $propListText = "PROPIEDADES DISPONIBLES EN CATÁLOGO:\n";
        foreach ($propertiesContext as $p) {
            $propListText .= "- [CÓDIGO: {$p['code']}] {$p['title']} | Tipo: {$p['property_type']} | Op: {$p['operation']} | Precio: {$p['price']} {$p['currency']} | Zona: {$p['zone']} | Hab: {$p['bedrooms']} | Baños: {$p['bathrooms']} | Sup: {$p['area_sqm']} m2 | Características: {$p['features']}\n";
        }
    } else {
        $propListText = "Actualmente no se encontraron propiedades exactas con esos filtros específicos en el catálogo, pero puedes ofrecer buscar opciones a medida o conectar con un asesor humano.";
    }

    return "Eres {$botName}, la asesora inmobiliaria virtual de élite de '{$agencyName}'.

OBJETIVO PRINCIPAL:
1. Brindar una atención cálida, profesional, persuasiva y empática a compradores, inquilinos e inversores inmobiliarios.
2. Identificar qué busca el cliente (Tipo de propiedad: Casa, Dpto, Terreno; Operación: Compra, Alquiler, Inversión; Zona de interés; Presupuesto aproximado).
3. Recomendar y destacar propiedades del catálogo disponible citando su CÓDIGO (ej. ONE-101) para que el sistema muestre las tarjetas visuales.
4. Capturar de manera natural los datos de contacto del cliente (Nombre y Teléfono/WhatsApp) para que un asesor especializado coordine una visita personalizada o envíe el dossier completo.

{$propListText}

REGLAS DE COMUNICACIÓN:
- Sé concisa, elegante y entusiasta. Respuestas de máximo 2 a 3 párrafos cortos.
- Si el usuario muestra interés en una propiedad, invítalo a agendar una visita o recibir la ficha técnica por WhatsApp.
- Cuando recomiendes propiedades, menciona el código exacto entre corchetes, por ejemplo: [ONE-101].
- Si el usuario te da su nombre, teléfono o presupuesto, agradécele y confirma que coordinarás con el equipo de {$agencyName}.
- Formato de salida: Devuelve texto conversacional natural con saltos de línea legibles y emojis apropiados.";
}

/**
 * Llamar a la API de OpenAI
 */
function callOpenAI($apiKey, $model, $systemPrompt, $messagesHistory, $userMessage) {
    $url = 'https://api.openai.com/v1/chat/completions';

    $apiMessages = [
        ['role' => 'system', 'content' => $systemPrompt]
    ];

    // Incluir últimos 6 mensajes del historial para mantener contexto
    $recent = array_slice($messagesHistory, -6);
    foreach ($recent as $msg) {
        $apiMessages[] = [
            'role' => $msg['sender'] === 'user' ? 'user' : 'assistant',
            'content' => $msg['message_text']
        ];
    }

    $apiMessages[] = ['role' => 'user', 'content' => $userMessage];

    $payload = [
        'model' => !empty($model) ? $model : 'gpt-4o-mini',
        'messages' => $apiMessages,
        'temperature' => 0.7,
        'max_tokens' => 500,
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . trim($apiKey)
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Compatible con proxies locales/SiteGround

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError || $httpCode !== 200) {
        return null;
    }

    $data = json_decode($response, true);
    return $data['choices'][0]['message']['content'] ?? null;
}

/**
 * Llamar a la API de Google Gemini
 */
function callGemini($apiKey, $model, $systemPrompt, $messagesHistory, $userMessage) {
    $modelName = !empty($model) ? $model : 'gemini-1.5-flash';
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key=" . trim($apiKey);

    $contents = [];
    $contents[] = [
        'role' => 'user',
        'parts' => [['text' => "INSTRUCCIÓN DEL SISTEMA:\n" . $systemPrompt]]
    ];
    $contents[] = [
        'role' => 'model',
        'parts' => [['text' => "Entendido. Soy la asesora virtual y aplicaré todas estas instrucciones."]]
    ];

    $recent = array_slice($messagesHistory, -4);
    foreach ($recent as $msg) {
        $role = $msg['sender'] === 'user' ? 'user' : 'model';
        $contents[] = [
            'role' => $role,
            'parts' => [['text' => $msg['message_text']]]
        ];
    }

    $contents[] = [
        'role' => 'user',
        'parts' => [['text' => $userMessage]]
    ];

    $payload = [
        'contents' => $contents,
        'generationConfig' => [
            'temperature' => 0.7,
            'maxOutputTokens' => 500
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        return null;
    }

    $data = json_decode($response, true);
    return $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
}

/**
 * Motor Heurístico Inteligente Local (Fallback cuando no hay API Key o para respuesta instantánea)
 */
function generateLocalRealEstateResponse($userMessage, $propertiesContext, $botName, $agencyName) {
    $msg = mb_strtolower($userMessage, 'UTF-8');

    // 1. Saludos iniciales
    if (preg_match('/\b(hola|buenos dias|buenas tardes|buenas noches|que tal|saludos|inicio)\b/u', $msg)) {
        $propCodes = !empty($propertiesContext) ? " Te presento algunas de nuestras propiedades más destacadas: [" . implode('], [', array_slice(array_column($propertiesContext, 'code'), 0, 2)) . "]." : "";
        return "¡Hola! Un gusto saludarte. Soy {$botName}, asesora inmobiliaria de {$agencyName}. 🏡✨\n\n¿En qué podemos ayudarte hoy? ¿Buscas comprar, alquilar, invertir en una propiedad o tienes un inmueble que deseas vender?{$propCodes}";
    }

    // 2. Intención de Alquiler
    if (preg_match('/\b(alquilar|alquiler|rentar|arrendar|departamento amoblado)\b/u', $msg)) {
        $rentals = array_filter($propertiesContext, fn($p) => strtolower($p['operation']) === 'alquiler');
        if (!empty($rentals)) {
            $p = reset($rentals);
            return "¡Excelente! En alquiler disponemos de opciones de primer nivel como nuestro departamento en {$p['zone']} ([{$p['code']}] por \${$p['price']} {$p['currency']}/mes). ✨\n\n¿En qué zona preferirías ubicarte y de cuántos dormitorios lo necesitas?";
        }
        return "Contamos con una selecta cartera de departamentos y casas en alquiler en las mejores zonas de la ciudad (Equipetrol, Sirari, Urubó). 🏙️\n\n¿Cuál es tu presupuesto mensual aproximado y para cuántas personas sería?";
    }

    // 3. Intención de Compra / Inversión
    if (preg_match('/\b(comprar|compra|inversion|invertir|plusvalia|airbnb|monoambiente)\b/u', $msg)) {
        $investments = array_filter($propertiesContext, fn($p) => in_array($p['property_type'], ['Departamento', 'Penthouse', 'Terreno']));
        $codes = !empty($investments) ? " Por ejemplo, disponemos de oportunidades exclusivas como [" . implode('] y [', array_slice(array_column($investments, 'code'), 0, 2)) . "]." : "";
        return "¡Invertir en bienes raíces es la decisión más sólida y rentable! 📈💎{$codes}\n\n¿Buscas una propiedad para vivir o para generar rentabilidad mensual (tipo Airbnb / Alquiler)?";
    }

    // 4. Preguntas de Casas / Urubó / Las Palmas
    if (preg_match('/\b(casa|condominio|urubo|las palmas|piscina)\b/u', $msg)) {
        $houses = array_filter($propertiesContext, fn($p) => $p['property_type'] === 'Casa');
        if (!empty($houses)) {
            $h = reset($houses);
            return "¡Tenemos residencias espectaculares en condominio cerrado! Te recomiendo conocer la propiedad [{$h['code']}] en {$h['zone']} (\${$h['price']} {$h['currency']}), con piscina y club house. 🌳🏊\n\n¿Te gustaría coordinar una visita presencial para conocerla este fin de semana?";
        }
    }

    // 5. Contacto / Agendar visita / WhatsApp
    if (preg_match('/\b(visita|visitar|agendar|asesor|whatsapp|telefono|contacto|humano|cita)\b/u', $msg)) {
        return "¡Con todo gusto! Uno de nuestros agentes senior puede coordinar la visita y enviarte el dossier completo con planos y fotos en alta resolución. 📲\n\n¿A qué número de WhatsApp te podemos contactar y cuál es tu nombre?";
    }

    // 6. Si detecta número de teléfono o datos de contacto
    if (preg_match('/\b(\+?[0-9]{7,13})\b/', $msg)) {
        return "¡Excelente! Hemos registrado tu número de contacto con éxito. ✅ Uno de nuestros asesores especializados de {$agencyName} te escribirá por WhatsApp en breve para brindarte atención personalizada y opciones a tu medida. ¡Muchas gracias!";
    }

    // 7. Respuesta general con propiedades de contexto
    if (!empty($propertiesContext)) {
        $best = array_slice($propertiesContext, 0, 2);
        $codeTags = array_map(fn($item) => "[{$item['code']}] ({$item['title']} en {$item['zone']})", $best);
        return "Basado en lo que buscas, te sugiero revisar estas opciones destacadas:\n\n• " . implode("\n• ", $codeTags) . "\n\n¿Te gustaría recibir más detalles sobre alguna de ellas o prefieres que busquemos según un presupuesto específico?";
    }

    return "En {$agencyName} disponemos de casas, departamentos, terrenos y oficinas en las zonas más cotizadas. 🏡🔑\n\nCuéntame: ¿Qué tipo de inmueble buscas, en qué zona te gustaría y cuál es tu rango de presupuesto aproximado?";
}
