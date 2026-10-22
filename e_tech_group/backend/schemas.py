from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# ponytail: field bounds prevent memory/disk exhaustion attacks
class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=120)
    phone: Optional[str] = Field(None, max_length=30)
    message: Optional[str] = Field(None, max_length=2000)

class ContactMessage(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=100)
