from fastapi import FastAPI, Depends, HTTPException, Header, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional, Dict
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import re
import secrets
import time

from . import models, schemas, database

# Asegurar que se creen las tablas en la BD SQLite
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="E-Tech Group API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---- Autenticación Dinámica con Expiración ----
ADMIN_PASSWORD = os.getenv("ETECH_ADMIN_PASSWORD", "caromilu")
ACTIVE_TOKENS: Dict[str, float] = {}  # token -> expiration timestamp (24h)
TOKEN_TTL = 24 * 3600

@app.post("/api/login")
def login(request: schemas.LoginRequest):
    if secrets.compare_digest(request.password, ADMIN_PASSWORD):
        token = secrets.token_urlsafe(32)
        ACTIVE_TOKENS[token] = time.time() + TOKEN_TTL
        return {"token": token}
    raise HTTPException(status_code=401, detail="Contraseña incorrecta")

@app.post("/api/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
        ACTIVE_TOKENS.pop(token, None)
    return {"ok": True}

def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado o formato inválido")
    token = authorization.split("Bearer ", 1)[1].strip()
    
    exp = ACTIVE_TOKENS.get(token)
    if not exp or time.time() > exp:
        ACTIVE_TOKENS.pop(token, None)
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    return token

# ---- Endpoints de la API ----

@app.post("/api/contact", response_model=schemas.ContactMessage)
def create_message(message: schemas.ContactMessageCreate, db: Session = Depends(get_db)):
    db_message = models.ContactMessage(
        name=message.name,
        email=message.email,
        phone=message.phone,
        message=message.message
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@app.get("/api/messages", response_model=List[schemas.ContactMessage])
def read_messages(db: Session = Depends(get_db), token: str = Depends(verify_token)):
    messages = db.query(models.ContactMessage).order_by(models.ContactMessage.created_at.desc()).all()
    return messages

@app.delete("/api/messages/{msg_id}")
def delete_message(msg_id: int, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_message = db.query(models.ContactMessage).filter(models.ContactMessage.id == msg_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(db_message)
    db.commit()
    return {"ok": True}

# ---- CMS Endpoints ----

ALLOWED_CMS_KEYS = {
    "hero_title", "hero_subtitle", "hero_whatsapp", "hero_whatsapp_link",
    "about_header", "about_highlight", "about_p1", "about_p2", "about_image",
    "mission_text", "vision_text", "values_text", "awards_text",
    "virtual_title", "virtual_intro", "virtual_image",
    "contact_address", "contact_city", "contact_phone", "footer_desc"
}

@app.get("/api/content", response_model=Dict[str, str])
def get_content(db: Session = Depends(get_db)):
    rows = db.query(models.SiteContent).all()
    return {row.key: row.value for row in rows}

@app.post("/api/content")
def save_content(content: Dict[str, str], db: Session = Depends(get_db), token: str = Depends(verify_token)):
    try:
        filtered = {}
        for k, v in content.items():
            if k in ALLOWED_CMS_KEYS:
                val_str = str(v).strip()
                # Basic XSS strip: forbid script/iframe tags and on* handlers or javascript: URIs
                clean_val = re.sub(r'<(script|iframe|object|embed)[^>]*>.*?</\1>', '', val_str, flags=re.IGNORECASE)
                clean_val = re.sub(r'on\w+\s*=', '', clean_val, flags=re.IGNORECASE)
                clean_val = re.sub(r'javascript:', '', clean_val, flags=re.IGNORECASE)
                filtered[k] = clean_val

        # Atomic upsert in single transaction
        for k, v in filtered.items():
            db.execute(
                text("INSERT INTO site_content (key, value) VALUES (:key, :value) ON CONFLICT(key) DO UPDATE SET value = excluded.value"),
                {"key": k, "value": v}
            )
        db.commit()
        return {"ok": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error guardando contenido: {str(e)}")

# Image magic bytes signature check
MAGIC_SIGNATURES = {
    ".png": b"\x89PNG\r\n\x1a\n",
    ".jpg": b"\xff\xd8\xff",
    ".jpeg": b"\xff\xd8\xff",
    ".gif": b"GIF8",
    ".webp": b"RIFF"
}

@app.post("/api/upload")
def upload_file(image: UploadFile = File(...), token: str = Depends(verify_token)):
    ext = os.path.splitext(image.filename)[1].lower() if image.filename else ""
    if ext not in MAGIC_SIGNATURES:
        raise HTTPException(status_code=400, detail="Formato no permitido (solo jpg, png, webp, gif - SVG deshabilitado por seguridad)")

    # Stream with max 10MB limit to prevent memory DoS
    MAX_SIZE = 10 * 1024 * 1024
    chunk_size = 64 * 1024
    total_read = 0
    buffer = bytearray()

    while True:
        chunk = image.file.read(chunk_size)
        if not chunk:
            break
        total_read += len(chunk)
        if total_read > MAX_SIZE:
            raise HTTPException(status_code=400, detail="Archivo excede el límite de 10MB")
        buffer.extend(chunk)

    if total_read == 0:
        raise HTTPException(status_code=400, detail="Archivo vacío")

    # Validate magic bytes
    expected_magic = MAGIC_SIGNATURES[ext]
    if not buffer.startswith(expected_magic):
        raise HTTPException(status_code=400, detail="El contenido del archivo no coincide con su extensión")

    filename = f"img_{int(time.time())}_{secrets.token_hex(4)}{ext}"

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_dirs = [
        os.path.join(base_dir, "images", "uploads"),
        os.path.join(base_dir, "frontend", "images", "uploads")
    ]

    for d in target_dirs:
        os.makedirs(d, exist_ok=True)
        file_path = os.path.join(d, filename)
        with open(file_path, "wb") as f:
            f.write(buffer)

    return {"url": f"images/uploads/{filename}"}

# Servir Frontend estático desde la carpeta frontend/
current_dir = os.path.dirname(__file__)
frontend_path = os.path.abspath(os.path.join(current_dir, "..", "frontend"))

if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
