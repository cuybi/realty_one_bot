# 🏢 One Chatbot IA - Chatbot Inmobiliario & CRM Inteligente

Sistema integral de Chatbot con Inteligencia Artificial para Bienes Raíces, diseñado específicamente para ser alojado de manera nativa, rápida y segura en **SiteGround** (PHP 8.x + MySQL + Frontend Moderno).

---

## 🚀 Despliegue en SiteGround en 3 Pasos

### Paso 1: Subir los Archivos al Hosting
1. Ingresa a tu panel de **SiteGround** y ve a **Site Tools** > **Site** > **File Manager**.
2. Sube todos los archivos y carpetas de `one_chatbot` a la carpeta `public_html` (o a una subcarpeta como `public_html/chatbot/`).

### Paso 2: Crear la Base de Datos MySQL en SiteGround
1. En **Site Tools**, ve a **Site** > **MySQL** > **Databases**.
2. Haz clic en **Create Database** (ej. `midominio_bot`).
3. Ve a la pestaña **Users** y crea un usuario MySQL con una contraseña segura.
4. Asigna el usuario a la base de datos recién creada dándole **All Privileges**.

### Paso 3: Ejecutar el Asistente de Instalación
1. Abre tu navegador e ingresa a: `https://tudominio.com/setup.php` (o `https://tudominio.com/chatbot/setup.php`).
2. Ingresa los datos de tu Base de Datos MySQL creada en el Paso 2:
   - **Host:** `localhost`
   - **Nombre de BD:** el nombre creado en Site Tools
   - **Usuario:** el usuario creado
   - **Contraseña:** tu contraseña de base de datos
3. Opcionalmente ingresa tu **API Key de OpenAI** o **Google Gemini** y tu número de WhatsApp de atención.
4. Haz clic en **"Probar Conexión y Crear Tablas"**. ¡Listo!

---

## 📁 Estructura del Proyecto

```text
one_chatbot/
├── .htaccess                 # Seguridad y cabeceras CORS
├── index.html                # Web pública, catálogo y widget de chat
├── setup.php                 # Asistente web de instalación para MySQL en SiteGround
├── schema.sql                # Esquema de tablas y propiedades de ejemplo para phpMyAdmin
├── README.md                 # Esta documentación
│
├── config/
│   ├── db.php                # Conector PDO MySQL (con fallback SQLite local)
│   └── ai_config.php         # Motor IA (OpenAI / Gemini / Heurístico Local)
│
├── api/
│   ├── chat.php              # Endpoint del chat (calificación de leads, tarjetas)
│   ├── properties.php        # API de propiedades (búsqueda y CRUD)
│   └── leads.php             # API de prospectos y métricas CRM
│
├── admin/
│   └── index.html            # Panel de Control CRM (leads, métricas, propiedades)
│
├── css/
│   ├── style.css             # Estilos de la landing page y chat
│   └── admin.css             # Estilos del panel CRM
│
└── js/
    ├── chat.js               # Lógica del cliente del chat y catálogo
    └── admin.js              # Lógica del panel CRM
```

---

## 💡 Características Principales

- 🤖 **Asesor Virtual Inmobiliario:** Responde dudas sobre compra, alquiler e inversiones con respuestas profesionales y humanas.
- 📸 **Tarjetas Visuales de Propiedades:** Enlace directo con fotos, precios en USD/BOB y botón para agendar visitas directas por WhatsApp.
- 🎯 **Extracción Automática de Leads:** Detecta nombre, teléfono, email y presupuesto en el texto de la conversación y calcula el *Lead Score*.
- 📊 **Panel CRM Completo:** Monitorea prospectos capturados en tiempo real, lee la transcripción completa de la conversación y exporta a Excel/CSV.
- 🛡️ **Seguridad Total:** Las API Keys nunca se exponen al navegador cliente; todo se procesa en el backend PHP.
