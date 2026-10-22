-- ==========================================================
-- ONE CHATBOT - ESQUEMA DE BASE DE DATOS MYSQL (SITEGROUND)
-- ==========================================================
-- Este archivo crea las tablas necesarias y datos iniciales para
-- el chatbot inmobiliario inteligente 'one_chatbot'.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABLA: PROPIEDADES (Catálogo Inmobiliario)
CREATE TABLE IF NOT EXISTS `properties` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) UNIQUE NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `operation` ENUM('Venta', 'Alquiler', 'Anticrético') NOT NULL DEFAULT 'Venta',
    `property_type` ENUM('Casa', 'Departamento', 'Terreno', 'Oficina', 'Comercial', 'Penthouse') NOT NULL DEFAULT 'Departamento',
    `price` DECIMAL(12, 2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    `city` VARCHAR(100) NOT NULL DEFAULT 'Santa Cruz',
    `zone` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NULL,
    `bedrooms` INT DEFAULT 0,
    `bathrooms` INT DEFAULT 0,
    `garages` INT DEFAULT 0,
    `area_sqm` DECIMAL(10, 2) DEFAULT 0,
    `description` TEXT,
    `features` TEXT COMMENT 'Lista de características separadas por coma o JSON',
    `images` TEXT COMMENT 'URLs de imágenes separadas por coma o JSON',
    `whatsapp_agent` VARCHAR(50) DEFAULT '+59170000000',
    `is_featured` TINYINT(1) DEFAULT 0,
    `status` ENUM('Disponible', 'Reservado', 'Vendido', 'Alquilado') NOT NULL DEFAULT 'Disponible',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_zone_op` (`zone`, `operation`),
    INDEX `idx_price` (`price`),
    INDEX `idx_type` (`property_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA: LEADS / PROSPECTOS
CREATE TABLE IF NOT EXISTS `leads` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `session_id` VARCHAR(100) UNIQUE NOT NULL,
    `full_name` VARCHAR(150) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(150) NULL,
    `interest_type` VARCHAR(50) NULL COMMENT 'Venta, Alquiler, Inversión',
    `property_type` VARCHAR(50) NULL COMMENT 'Casa, Dpto, Terreno',
    `preferred_zones` VARCHAR(255) NULL,
    `budget_min` DECIMAL(12, 2) DEFAULT 0,
    `budget_max` DECIMAL(12, 2) DEFAULT 0,
    `currency` VARCHAR(10) DEFAULT 'USD',
    `visit_date` VARCHAR(50) NULL COMMENT 'Fecha o día agendado',
    `visit_time` VARCHAR(50) NULL COMMENT 'Hora agendada ej. 10:00 AM',
    `ad_source` VARCHAR(100) DEFAULT 'Facebook Ad #1',
    `form_completed` TINYINT(1) DEFAULT 0,
    `lead_score` INT DEFAULT 10 COMMENT 'Puntaje de 0 a 100',
    `status` ENUM('Nuevo', 'Contactado', 'Calificado', 'Visita Agendada', 'Cerrado', 'Descartado') NOT NULL DEFAULT 'Nuevo',
    `notes` TEXT NULL,
    `last_property_viewed` VARCHAR(100) NULL,
    `source` VARCHAR(100) DEFAULT 'WhatsApp Facebook Flow',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_status` (`status`),
    INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA: CONVERSACIONES
CREATE TABLE IF NOT EXISTS `conversations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `session_id` VARCHAR(100) NOT NULL,
    `lead_id` INT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `message_count` INT DEFAULT 0,
    `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_message_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL,
    INDEX `idx_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA: MENSAJES
CREATE TABLE IF NOT EXISTS `messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `session_id` VARCHAR(100) NOT NULL,
    `sender` ENUM('user', 'bot', 'agent') NOT NULL,
    `message_text` TEXT NOT NULL,
    `payload_json` TEXT NULL COMMENT 'Tarjetas de propiedades recomendadas u opciones enviadas',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_msg_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA: CONFIGURACIÓN GENERAL
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) UNIQUE NOT NULL,
    `setting_value` TEXT NULL,
    `setting_group` VARCHAR(50) DEFAULT 'general',
    `description` VARCHAR(255) NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- DATOS INICIALES DE CONFIGURACIÓN
-- ==========================================================
INSERT INTO `settings` (`setting_key`, `setting_value`, `setting_group`, `description`) VALUES
('agency_name', 'One Real Estate IA', 'general', 'Nombre de la empresa inmobiliaria'),
('whatsapp_number', '59170000000', 'general', 'Número de WhatsApp principal de atención (con código de país)'),
('bot_name', 'Valeria - Asesora Inmobiliaria Virtual', 'bot', 'Nombre del asistente virtual'),
('ai_provider', 'local', 'ai', 'Proveedor de IA (openai, gemini o local)'),
('openai_api_key', '', 'ai', 'Clave API de OpenAI'),
('gemini_api_key', '', 'ai', 'Clave API de Google Gemini'),
('ai_model', 'gpt-4o-mini', 'ai', 'Modelo a utilizar (ej. gpt-4o-mini, gemini-1.5-flash)'),
('primary_color', '#0b132b', 'design', 'Color primario de la marca'),
('accent_color', '#d4af37', 'design', 'Color de acento dorado')
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- ==========================================================
-- CATÁLOGO INICIAL DE PROPIEDADES DE EJEMPLO
-- ==========================================================
INSERT INTO `properties` 
(`code`, `title`, `operation`, `property_type`, `price`, `currency`, `city`, `zone`, `address`, `bedrooms`, `bathrooms`, `garages`, `area_sqm`, `description`, `features`, `images`, `whatsapp_agent`, `is_featured`, `status`) 
VALUES
('ONE-101', 'Penthouse de Lujo con Vista Panorámica', 'Venta', 'Penthouse', 285000.00, 'USD', 'Santa Cruz', 'Equipetrol Norte', 'Av. San Martín esq. Calle 8', 3, 4, 2, 240.00, 
'Exclusivo penthouse de 2 niveles con acabados en mármol, terraza privada con jacuzzi, churrasquera y vista inigualable de la ciudad.', 
'Piscina privada, Jacuzzi, Terraza, Seguridad 24/7, Acabados italianos, Domótica', 
'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80,https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', 
'59170000000', 1, 'Disponible'),

('ONE-102', 'Casa Moderna en Condominio Cerrado', 'Venta', 'Casa', 195000.00, 'USD', 'Santa Cruz', 'Urubó', 'Condominio La Riviera', 4, 5, 3, 380.00, 
'Hermosa residencia a estrenar de diseño vanguardista, amplios ventanales, jardín interior, club house con piscina olímpica y canchas de pádel.', 
'Jardín amplio, Churrasquera, Seguridad privada, Club House, Canchas deportivas', 
'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80,https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80', 
'59170000000', 1, 'Disponible'),

('ONE-103', 'Departamento Ejecutivo de 2 Dormitorios', 'Alquiler', 'Departamento', 750.00, 'USD', 'Santa Cruz', 'Sirari', 'Calle Las Palmeras #140', 2, 2, 1, 85.00, 
'Departamento completamente amoblado y equipado con electrodomésticos de primera línea. Edificio con piscina infinity en rooftop y coworking.', 
'Amoblado, Aire Acondicionado, Coworking, Gimnasio, Piscina Rooftop, Balcón', 
'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80,https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', 
'59170000000', 0, 'Disponible'),

('ONE-104', 'Residencia Minimalista con Piscina Propia', 'Venta', 'Casa', 340000.00, 'USD', 'Santa Cruz', 'Las Palmas', 'Barrio Las Palmas, Calle 3', 4, 6, 4, 450.00, 
'Majestuosa casa con piscina privada climatizada, galería con churrasquera techada, suite principal con walking closet doble y cocina con isla central.', 
'Piscina privada, Sistema de riego automático, Suite máster, Galería, Garaje para 4 vehículos', 
'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80,https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', 
'59170000000', 1, 'Disponible'),

('ONE-105', 'Monoambiente de Inversión con Alta Rentabilidad', 'Venta', 'Departamento', 48000.00, 'USD', 'Santa Cruz', 'Equipetrol', 'Av. Busch y 2do Anillo', 1, 1, 0, 36.00, 
'Excelente opción para Airbnb y renta temporal. Entrega inmediata, finamente amoblado, edificio moderno con áreas sociales completas.', 
'Ideal Airbnb, Alta plusvalía, Sala de cine, Churrasquera, Solarium', 
'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', 
'59170000000', 0, 'Disponible'),

('ONE-106', 'Terreno Residencial en Zona Exclusiva', 'Venta', 'Terreno', 115000.00, 'USD', 'Santa Cruz', 'Urubó', 'Urbanización Los Bosques', 0, 0, 0, 750.00, 
'Terreno totalmente plano y regular dentro del más codiciado condominio de Urubó. Servicios básicos subterráneos y seguridad las 24 horas.', 
'Totalmente plano, Salida a parque, Alta plusvalía, Servicios subterráneos', 
'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', 
'59170000000', 0, 'Disponible')
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

SET FOREIGN_KEY_CHECKS = 1;
