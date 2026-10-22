<?php
/**
 * ONE CHATBOT - CONEXIÓN A BASE DE DATOS (OPTIMIZADO PARA SITEGROUND)
 * Soporta MySQL (MariaDB) nativo en SiteGround y modo SQLite automático para pruebas locales.
 */

// 1. CONFIGURACIÓN DE CREDENCIALES
// Modifica estos valores con los datos creados en Site Tools -> MySQL de SiteGround:
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'one_chatbot_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_CHARSET', 'utf8mb4');

// Modo fallback local (usa SQLite si MySQL no está iniciado o configurado localmente)
define('ALLOW_SQLITE_FALLBACK', true);
define('SQLITE_PATH', __DIR__ . '/../data/chatbot_local.sqlite');

/**
 * Obtener la instancia PDO de la Base de Datos
 * @return PDO
 */
function getDB() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $errors = [];

    // Intento 1: Conexión MySQL (SiteGround / Servidor de Producción)
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 5,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        $errors[] = "MySQL: " . $e->getMessage();
    }

    // Intento 2: Fallback SQLite (Para pruebas inmediatas sin configurar MySQL localmente)
    if (ALLOW_SQLITE_FALLBACK) {
        try {
            $dataDir = dirname(SQLITE_PATH);
            if (!is_dir($dataDir)) {
                mkdir($dataDir, 0777, true);
            }
            $isNew = !file_exists(SQLITE_PATH);
            $pdo = new PDO("sqlite:" . SQLITE_PATH);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            if ($isNew) {
                initSqliteSchema($pdo);
            }
            return $pdo;
        } catch (Exception $e) {
            $errors[] = "SQLite: " . $e->getMessage();
        }
    }

    // Si fallan ambos, devolver error JSON estructurado
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => 'error',
        'message' => 'No se pudo conectar a la base de datos.',
        'details' => $errors,
        'help' => 'Por favor ejecuta setup.php o configura tus credenciales en config/db.php para SiteGround.'
    ]);
    exit;
}

/**
 * Inicializar esquema en SQLite en caso de entorno local sin MySQL
 */
function initSqliteSchema(PDO $db) {
    $db->exec("
        CREATE TABLE IF NOT EXISTS properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            operation TEXT NOT NULL DEFAULT 'Venta',
            property_type TEXT NOT NULL DEFAULT 'Departamento',
            price REAL NOT NULL,
            currency TEXT NOT NULL DEFAULT 'USD',
            city TEXT NOT NULL DEFAULT 'Santa Cruz',
            zone TEXT NOT NULL,
            address TEXT,
            bedrooms INTEGER DEFAULT 0,
            bathrooms INTEGER DEFAULT 0,
            garages INTEGER DEFAULT 0,
            area_sqm REAL DEFAULT 0,
            description TEXT,
            features TEXT,
            images TEXT,
            whatsapp_agent TEXT DEFAULT '+59170000000',
            is_featured INTEGER DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'Disponible',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            full_name TEXT,
            phone TEXT,
            email TEXT,
            interest_type TEXT,
            property_type TEXT,
            preferred_zones TEXT,
            budget_min REAL DEFAULT 0,
            budget_max REAL DEFAULT 0,
            currency TEXT DEFAULT 'USD',
            visit_date TEXT,
            visit_time TEXT,
            ad_source TEXT DEFAULT 'Facebook Ad #1',
            form_completed INTEGER DEFAULT 0,
            lead_score INTEGER DEFAULT 10,
            status TEXT NOT NULL DEFAULT 'Nuevo',
            notes TEXT,
            last_property_viewed TEXT,
            source TEXT DEFAULT 'WhatsApp Facebook Flow',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            lead_id INTEGER,
            ip_address TEXT,
            user_agent TEXT,
            message_count INTEGER DEFAULT 0,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            message_text TEXT NOT NULL,
            payload_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_key TEXT UNIQUE NOT NULL,
            setting_value TEXT,
            setting_group TEXT DEFAULT 'general',
            description TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");

    // Insertar propiedades de ejemplo en SQLite
    $db->exec("
        INSERT OR IGNORE INTO settings (setting_key, setting_value, setting_group, description) VALUES
        ('agency_name', 'One Real Estate IA', 'general', 'Nombre de la empresa inmobiliaria'),
        ('whatsapp_number', '59170000000', 'general', 'WhatsApp principal de atención'),
        ('bot_name', 'Valeria - Asesora Virtual', 'bot', 'Nombre del bot'),
        ('ai_provider', 'local', 'ai', 'Proveedor de IA');

        INSERT OR IGNORE INTO properties 
        (code, title, operation, property_type, price, currency, city, zone, address, bedrooms, bathrooms, garages, area_sqm, description, features, images, whatsapp_agent, is_featured, status) 
        VALUES
        ('ONE-101', 'Penthouse de Lujo con Vista Panorámica', 'Venta', 'Penthouse', 285000.00, 'USD', 'Santa Cruz', 'Equipetrol Norte', 'Av. San Martín esq. Calle 8', 3, 4, 2, 240.00, 'Exclusivo penthouse de 2 niveles con acabados en mármol, terraza privada con jacuzzi y churrasquera.', 'Piscina privada, Jacuzzi, Terraza, Seguridad 24/7', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', '59170000000', 1, 'Disponible'),
        ('ONE-102', 'Casa Moderna en Condominio Cerrado', 'Venta', 'Casa', 195000.00, 'USD', 'Santa Cruz', 'Urubó', 'Condominio La Riviera', 4, 5, 3, 380.00, 'Hermosa residencia a estrenar de diseño vanguardista, jardín interior y club house con piscina.', 'Jardín amplio, Churrasquera, Seguridad privada, Club House', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', '59170000000', 1, 'Disponible'),
        ('ONE-103', 'Departamento Ejecutivo de 2 Dormitorios', 'Alquiler', 'Departamento', 750.00, 'USD', 'Santa Cruz', 'Sirari', 'Calle Las Palmeras #140', 2, 2, 1, 85.00, 'Departamento completamente amoblado con electrodomésticos de primera línea. Rooftop con piscina y coworking.', 'Amoblado, Aire Acondicionado, Coworking, Gimnasio, Piscina', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', '59170000000', 0, 'Disponible'),
        ('ONE-104', 'Residencia Minimalista con Piscina Propia', 'Venta', 'Casa', 340000.00, 'USD', 'Santa Cruz', 'Las Palmas', 'Barrio Las Palmas, Calle 3', 4, 6, 4, 450.00, 'Majestuosa casa con piscina privada climatizada, galería con churrasquera techada y suite máster con walking closet.', 'Piscina privada, Suite máster, Galería, Garaje 4 vehículos', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', '59170000000', 1, 'Disponible'),
        ('ONE-105', 'Monoambiente de Inversión con Alta Rentabilidad', 'Venta', 'Departamento', 48000.00, 'USD', 'Santa Cruz', 'Equipetrol', 'Av. Busch y 2do Anillo', 1, 1, 0, 36.00, 'Excelente opción para Airbnb y renta temporal. Entrega inmediata, finamente amoblado.', 'Ideal Airbnb, Alta plusvalía, Sala de cine, Churrasquera', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', '59170000000', 0, 'Disponible'),
        ('ONE-106', 'Terreno Residencial en Zona Exclusiva', 'Venta', 'Terreno', 115000.00, 'USD', 'Santa Cruz', 'Urubó', 'Urbanización Los Bosques', 0, 0, 0, 750.00, 'Terreno totalmente plano y regular dentro de condominio consolidado en Urubó.', 'Totalmente plano, Salida a parque, Alta plusvalía', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', '59170000000', 0, 'Disponible');
    ");
}
