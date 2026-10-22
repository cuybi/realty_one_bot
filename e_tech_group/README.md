# E-Tech Group - Sitio Web y Sistema de Contactos

Sistema web corporativo con backend FastAPI, persistencia SQLite y panel de administración protegido.

## 🚀 Inicio Rápido (Local)

Hacer doble clic en `INICIAR_SERVIDOR.bat` o ejecutar:

```bash
.\.venv\Scripts\uvicorn.exe backend.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Sitio Web:** `http://127.0.0.1:8000/`
- **Panel Administrativo:** `http://127.0.0.1:8000/admin.html`
- **Documentación de API:** `http://127.0.0.1:8000/docs`

## 🔐 Seguridad y Configuración

- **Contraseña de administrador:** Por defecto `caromilu`. Se puede configurar mediante la variable de entorno `ETECH_ADMIN_PASSWORD`.
- **Tokens de sesión:** Generados dinámicamente con `secrets` estándar en cada inicio de sesión.
- **Validación:** Límites de longitud en esquemas Pydantic para prevenir abusos de almacenamiento.

## 📁 Estructura

- `backend/`: API FastAPI (`main.py`), modelos SQLAlchemy (`models.py`), esquemas Pydantic (`schemas.py`) y conexión SQLite (`database.py`).
- `frontend/`: Archivos web activos (`index.html`, `admin.html`, `styles.css`, `script.js`, `images/`).
- `etech.db`: Base de datos SQLite local.
