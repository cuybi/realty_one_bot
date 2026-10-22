from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
import datetime
from .database import Base
import enum

class PaymentMethod(str, enum.Enum):
    efectivo = "Efectivo"
    transferencia = "Transferencia"
    qr = "QR"

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    dish_name = Column(String, index=True)
    quantity = Column(Integer)
    unit_price = Column(Float)
    total_price = Column(Float)
    payment_method = Column(String)

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    item_name = Column(String, index=True)
    category = Column(String)
    quantity = Column(Float)
    unit_price = Column(Float)
    total_price = Column(Float)
