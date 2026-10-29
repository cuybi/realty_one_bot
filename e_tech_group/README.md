# E-Tech Group - Sitio Web, CMS y Sistema de Contactos

Sistema web corporativo con backend FastAPI, persistencia SQLite, panel de administración con bandeja de contactos y gestor de contenidos (CMS) dinámico.

## 🚀 Inicio Rápido (Local)

Hacer doble clic en `INICIAR_SERVIDOR.bat` o ejecutar:

```bash
.\.venv\Scripts\uvicorn.exe backend.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Sitio Web:** `http://127.0.0.1:8000/`
- **Panel Administrativo (Inbox + CMS):** `http://127.0.0.1:8000/admin.html`
- **Documentación de API:** `http://127.0.0.1:8000/docs`

## 🔐 Credenciales y Seguridad

- **Contraseña de administrador:** `caromilu` (personalizable con la variable de entorno `ETECH_ADMIN_PASSWORD`).
- **Autenticación:** Tokens de sesión Bearer generados dinámicamente (`secrets`).
- **Endpoints CMS:**
  - `GET /api/content`: Obtiene textos y fotos configuradas (público).
  - `POST /api/content`: Guarda textos del CMS (requiere token).
  - `POST /api/upload`: Subida de imágenes a `images/uploads/` (requiere token).
  - `POST /api/contact`: Formulario de contacto con soporte offline.
  - `GET /api/messages`: Bandeja de mensajes (requiere token).

## 📁 Estructura

- `backend/`: API FastAPI (`main.py`), modelos SQLAlchemy (`models.py`), esquemas Pydantic (`schemas.py`) y conexión SQLite (`database.py`).
- `api/`: Endpoint dual PHP (`index.php`) para despliegue en hosting compartido (Apache / SiteGround).
- `frontend/`: Archivos web activos (`index.html`, `admin.html`, `styles.css`, `script.js`, `images/`).
- `etech.db`: Base de datos SQLite local (tablas `contact_messages` y `site_content`).
