from pydantic import BaseModel
from datetime import date
from typing import Optional

class TransactionBase(BaseModel):
    date: date
    description: str
    amount: float
    category: Optional[str] = "Uncategorized"

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int

    class Config:
        from_attributes = True

class PortfolioBase(BaseModel):
    ticker: str
    quantity: float
    average_price: float

class PortfolioCreate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: int
    current_price: Optional[float] = None
    profit_loss: Optional[float] = None

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    query: str
