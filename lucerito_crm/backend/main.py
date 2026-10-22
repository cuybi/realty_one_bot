from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
import os

from . import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Lucerito CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Endpoints

@app.post("/api/sales", response_model=schemas.Sale)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    total_price = sale.quantity * sale.unit_price
    db_sale = models.Sale(**sale.dict(), total_price=total_price)
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale

@app.get("/api/sales", response_model=List[schemas.Sale])
def read_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sales = db.query(models.Sale).order_by(models.Sale.date.desc()).offset(skip).limit(limit).all()
    return sales

@app.delete("/api/sales/{sale_id}")
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    db_sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not db_sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    db.delete(db_sale)
    db.commit()
    return {"ok": True}

@app.post("/api/expenses", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    total_price = expense.quantity * expense.unit_price
    db_expense = models.Expense(**expense.dict(), total_price=total_price)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@app.get("/api/expenses", response_model=List[schemas.Expense])
def read_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).order_by(models.Expense.date.desc()).offset(skip).limit(limit).all()
    return expenses

@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(db_expense)
    db.commit()
    return {"ok": True}

@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    # Hoy
    today = func.date(models.Sale.date) == func.date('now')
    
    total_sales = db.query(func.sum(models.Sale.total_price)).scalar() or 0.0
    total_expenses = db.query(func.sum(models.Expense.total_price)).scalar() or 0.0
    
    # Ventas de hoy
    today_sales_q = db.query(func.sum(models.Sale.total_price)).filter(func.date(models.Sale.date) == func.date('now')).scalar() or 0.0
    today_expenses_q = db.query(func.sum(models.Expense.total_price)).filter(func.date(models.Expense.date) == func.date('now')).scalar() or 0.0
    
    net_profit = total_sales - total_expenses
    
    # Plato más vendido
    top_dish = db.query(models.Sale.dish_name, func.sum(models.Sale.quantity).label('total_qty')).group_by(models.Sale.dish_name).order_by(func.sum(models.Sale.quantity).desc()).first()
    
    top_dish_name = top_dish[0] if top_dish else "N/A"
    
    # Pago más usado
    top_payment = db.query(models.Sale.payment_method, func.count(models.Sale.id).label('total_uses')).group_by(models.Sale.payment_method).order_by(func.count(models.Sale.id).desc()).first()
    top_payment_method = top_payment[0] if top_payment else "N/A"

    return {
        "today_sales": today_sales_q,
        "today_expenses": today_expenses_q,
        "total_sales": total_sales,
        "total_expenses": total_expenses,
        "net_profit": net_profit,
        "top_dish": top_dish_name,
        "top_payment_method": top_payment_method
    }

# Servir Frontend
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
