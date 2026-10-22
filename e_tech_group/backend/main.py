from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import secrets

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

# ---- Autenticación Dinámica ----
# ponytail: stdlib secrets token + in-memory set; upgrade to Redis/DB if multi-instance
ADMIN_PASSWORD = os.getenv("ETECH_ADMIN_PASSWORD", "caromilu")
ACTIVE_TOKENS = set()

@app.post("/api/login")
def login(request: schemas.LoginRequest):
    if secrets.compare_digest(request.password, ADMIN_PASSWORD):
        token = secrets.token_urlsafe(32)
        ACTIVE_TOKENS.add(token)
        return {"token": token}
    raise HTTPException(status_code=401, detail="Contraseña incorrecta")

def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado o formato inválido")
    token = authorization.split("Bearer ", 1)[1].strip()
    if token not in ACTIVE_TOKENS:
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

# Servir Frontend estático desde la carpeta frontend/
current_dir = os.path.dirname(__file__)
frontend_path = os.path.abspath(os.path.join(current_dir, "..", "frontend"))

if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
