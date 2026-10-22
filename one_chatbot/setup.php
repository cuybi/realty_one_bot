<?php
/**
 * ONE CHATBOT - ASISTENTE VISUAL DE INSTALACIÓN Y CONFIGURACIÓN (SITEGROUND)
 */

$configFile = __DIR__ . '/config/db.php';
$schemaFile = __DIR__ . '/schema.sql';
$message = '';
$status = '';

// Procesar formulario de instalación
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbHost = trim($_POST['db_host'] ?? 'localhost');
    $dbName = trim($_POST['db_name'] ?? '');
    $dbUser = trim($_POST['db_user'] ?? '');
    $dbPass = trim($_POST['db_pass'] ?? '');
    $dbPort = trim($_POST['db_port'] ?? '3306');
    $openaiKey = trim($_POST['openai_key'] ?? '');
    $geminiKey = trim($_POST['gemini_key'] ?? '');
    $agencyName = trim($_POST['agency_name'] ?? 'One Real Estate IA');
    $whatsapp = trim($_POST['whatsapp'] ?? '59170000000');

    try {
        // 1. Probar conexión MySQL
        $dsn = "mysql:host={$dbHost};port={$dbPort};charset=utf8mb4";
        $pdo = new PDO($dsn, $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5
        ]);

        // Crear base de datos si no existe
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE `{$dbName}`");

        // 2. Ejecutar Schema SQL
        if (file_exists($schemaFile)) {
            $sql = file_get_contents($schemaFile);
            $pdo->exec($sql);
        }

        // 3. Guardar ajustes personalizados en la tabla settings
        $stmtSet = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        $stmtSet->execute(['agency_name', $agencyName, $agencyName]);
        $stmtSet->execute(['whatsapp_number', $whatsapp, $whatsapp]);
        if (!empty($openaiKey)) {
            $stmtSet->execute(['openai_api_key', $openaiKey, $openaiKey]);
            $stmtSet->execute(['ai_provider', 'openai', 'openai']);
        }
        if (!empty($geminiKey)) {
            $stmtSet->execute(['gemini_api_key', $geminiKey, $geminiKey]);
            if (empty($openaiKey)) {
                $stmtSet->execute(['ai_provider', 'gemini', 'gemini']);
            }
        }

        // 4. Actualizar archivo config/db.php
        $dbPhpContent = "<?php
/**
 * ONE CHATBOT - CONEXIÓN A BASE DE DATOS
 * Generado automáticamente por el Asistente de Instalación
 */

define('DB_HOST', '" . addslashes($dbHost) . "');
define('DB_NAME', '" . addslashes($dbName) . "');
define('DB_USER', '" . addslashes($dbUser) . "');
define('DB_PASS', '" . addslashes($dbPass) . "');
define('DB_PORT', '" . addslashes($dbPort) . "');
define('DB_CHARSET', 'utf8mb4');

define('ALLOW_SQLITE_FALLBACK', true);
define('SQLITE_PATH', __DIR__ . '/../data/chatbot_local.sqlite');

function getDB() {
    static \$pdo = null;
    if (\$pdo !== null) return \$pdo;

    try {
        \$dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        \$options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        \$pdo = new PDO(\$dsn, DB_USER, DB_PASS, \$options);
        return \$pdo;
    } catch (PDOException \$e) {
        if (ALLOW_SQLITE_FALLBACK) {
            \$dataDir = dirname(SQLITE_PATH);
            if (!is_dir(\$dataDir)) mkdir(\$dataDir, 0777, true);
            \$pdo = new PDO('sqlite:' . SQLITE_PATH);
            \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            \$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            return \$pdo;
        }
        die(json_encode(['status' => 'error', 'message' => 'Error DB: ' . \$e->getMessage()]));
    }
}
";
        file_put_contents($configFile, $dbPhpContent);

        $status = 'success';
        $message = '¡Instalación completada con éxito en MySQL! La base de datos, tablas y catálogo inicial ya están listos.';

    } catch (Exception $e) {
        $status = 'error';
        $message = 'Error de conexión MySQL: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalador One Chatbot - SiteGround & MySQL</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #0b132b;
            --accent: #d4af37;
            --accent-glow: rgba(212, 175, 55, 0.25);
            --bg: #070b19;
            --card-bg: rgba(16, 26, 56, 0.85);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --border: rgba(255, 255, 255, 0.1);
            --success: #10b981;
            --danger: #ef4444;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body {
            background: radial-gradient(circle at top right, #1c2541, #070b19 80%);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px 15px;
        }
        .container {
            max-width: 650px;
            width: 100%;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px var(--accent-glow);
            backdrop-filter: blur(16px);
        }
        .header { text-align: center; margin-bottom: 30px; }
        .logo-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: rgba(212, 175, 55, 0.15);
            border: 1px solid var(--accent);
            padding: 8px 18px;
            border-radius: 50px;
            color: var(--accent);
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 15px;
        }
        h1 { font-size: 26px; font-weight: 800; margin-bottom: 8px; }
        p.subtitle { color: var(--text-muted); font-size: 14px; line-height: 1.5; }
        
        .alert {
            padding: 16px 20px;
            border-radius: 12px;
            font-size: 14px;
            margin-bottom: 25px;
            line-height: 1.5;
        }
        .alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid var(--success); color: #34d399; }
        .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid var(--danger); color: #f87171; }
        
        .section-title {
            font-size: 15px;
            font-weight: 700;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 20px 0 12px 0;
            border-bottom: 1px solid var(--border);
            padding-bottom: 6px;
        }
        .form-group { margin-bottom: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #cbd5e1; }
        input {
            width: 100%;
            background: rgba(11, 19, 43, 0.7);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 12px 14px;
            color: #fff;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        input:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .btn-submit {
            width: 100%;
            background: linear-gradient(135deg, #d4af37, #f39c12);
            color: #0b132b;
            font-size: 16px;
            font-weight: 800;
            padding: 15px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 25px;
            box-shadow: 0 10px 25px -5px rgba(212, 175, 55, 0.4);
        }
        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px -5px rgba(212, 175, 55, 0.6);
        }
        .links-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 25px;
        }
        .btn-link {
            display: block;
            text-align: center;
            padding: 12px;
            border-radius: 10px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 700;
            transition: 0.2s;
        }
        .btn-chat { background: var(--accent); color: #0b132b; }
        .btn-admin { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid var(--border); }
        .btn-chat:hover, .btn-admin:hover { transform: translateY(-2px); opacity: 0.9; }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <div class="logo-badge">🏢 ONE CHATBOT IA</div>
        <h1>Asistente de Configuración</h1>
        <p class="subtitle">Configura la conexión a tu base de datos MySQL en SiteGround y las claves de Inteligencia Artificial para tu inmobiliaria.</p>
    </div>

    <?php if (!empty($message)): ?>
        <div class="alert alert-<?php echo $status; ?>">
            <?php echo htmlspecialchars($message); ?>
        </div>
        <?php if ($status === 'success'): ?>
            <div class="links-row">
                <a href="index.html" class="btn-link btn-chat">🚀 Abrir Chatbot Inmobiliario</a>
                <a href="admin/index.html" class="btn-link btn-admin">⚙️ Abrir Panel CRM</a>
            </div>
        <?php endif; ?>
    <?php endif; ?>

    <form method="POST" action="">
        <div class="section-title">1. Base de Datos MySQL (SiteGround)</div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Servidor MySQL (Host)</label>
                <input type="text" name="db_host" value="localhost" required>
            </div>
            <div class="form-group">
                <label>Puerto MySQL</label>
                <input type="text" name="db_port" value="3306" required>
            </div>
        </div>

        <div class="form-group">
            <label>Nombre de Base de Datos</label>
            <input type="text" name="db_name" placeholder="ej. one_chatbot_db o tudominio_bot" required>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Usuario MySQL</label>
                <input type="text" name="db_user" placeholder="ej. root o tudominio_user" required>
            </div>
            <div class="form-group">
                <label>Contraseña MySQL</label>
                <input type="password" name="db_pass" placeholder="Contraseña de la BD">
            </div>
        </div>

        <div class="section-title">2. Identidad Inmobiliaria</div>

        <div class="form-row">
            <div class="form-group">
                <label>Nombre de la Inmobiliaria</label>
                <input type="text" name="agency_name" value="One Real Estate IA" required>
            </div>
            <div class="form-group">
                <label>WhatsApp de Contacto (con código)</label>
                <input type="text" name="whatsapp" value="+59170000000" placeholder="+59170000000" required>
            </div>
        </div>

        <div class="section-title">3. Claves de Inteligencia Artificial (Opcional)</div>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
            Si dejas las claves vacías, el sistema utilizará el <strong>Motor Heurístico Local Inteligente</strong> sin costo de API.
        </p>

        <div class="form-group">
            <label>OpenAI API Key (sk-...)</label>
            <input type="password" name="openai_key" placeholder="sk-proj-...">
        </div>

        <div class="form-group">
            <label>Google Gemini API Key (AIzaSy...)</label>
            <input type="password" name="gemini_key" placeholder="AIzaSy...">
        </div>

        <button type="submit" class="btn-submit">⚡ Probar Conexión y Crear Tablas</button>
    </form>
</div>

</body>
</html>
