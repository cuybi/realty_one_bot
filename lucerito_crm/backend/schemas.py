from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SaleBase(BaseModel):
    dish_name: str
    quantity: int
    unit_price: float
    payment_method: str

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: int
    date: datetime
    total_price: float

    class Config:
        orm_mode = True

class ExpenseBase(BaseModel):
    item_name: str
    category: str
    quantity: float
    unit_price: float

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    date: datetime
    total_price: float

    class Config:
        orm_mode = True
