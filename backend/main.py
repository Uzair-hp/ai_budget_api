from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import engine, get_db
import pandas as pd
import io
from ai_service import categorize_transaction, chat_with_finances
import yfinance as yf
from typing import List

# Initialize database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Budget API", description="An API for AI Budgeting and Financial Analysis")

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Budget API!"}

@app.get("/health")
def health_check():
    return {"status": "Healthy"}

@app.get("/api/transactions", response_model=list[schemas.Transaction])
def get_transactions(db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).all()
    return transactions

@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    contents = await file.read()
    
    try:
        df = pd.read_csv(io.BytesIO(contents))
        df.columns = [c.lower().strip() for c in df.columns]
        
        required_columns = {'date', 'description', 'amount'}
        if not required_columns.issubset(df.columns):
            raise HTTPException(
                status_code=400, 
                detail=f"CSV is missing required columns. Found: {list(df.columns)}"
            )

        new_transactions = []
        for _, row in df.iterrows():
            try:
                transaction_date = pd.to_datetime(row['date']).date()
            except:
                continue

            ai_category = categorize_transaction(str(row['description']))

            db_transaction = models.Transaction(
                date=transaction_date,
                description=str(row['description']),
                amount=float(row['amount']),
                category=ai_category 
            )
            new_transactions.append(db_transaction)
        
        if new_transactions:
            db.add_all(new_transactions)
            db.commit()

        return {
            "filename": file.filename,
            "total_rows": len(df),
            "successfully_saved": len(new_transactions),
            "status": "Success"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

# --- PORTFOLIO ENDPOINTS ---

@app.post("/api/portfolio", response_model=schemas.Portfolio)
def add_stock(stock: schemas.PortfolioCreate, db: Session = Depends(get_db)):
    db_stock = db.query(models.Portfolio).filter(models.Portfolio.ticker == stock.ticker.upper()).first()
    
    if db_stock:
        new_total_qty = db_stock.quantity + stock.quantity
        new_avg_price = ((db_stock.average_price * db_stock.quantity) + (stock.average_price * stock.quantity)) / new_total_qty
        db_stock.quantity = new_total_qty
        db_stock.average_price = new_avg_price
    else:
        db_stock = models.Portfolio(ticker=stock.ticker.upper(), quantity=stock.quantity, average_price=stock.average_price)
        db.add(db_stock)
    
    db.commit()
    db.refresh(db_stock)
    return db_stock

@app.get("/api/portfolio", response_model=List[schemas.Portfolio])
def get_portfolio(db: Session = Depends(get_db)):
    stocks = db.query(models.Portfolio).all()
    results = []
    
    for s in stocks:
        try:
            ticker = yf.Ticker(s.ticker)
            current_price = ticker.fast_info['last_price']
        except:
            current_price = s.average_price
            
        results.append({
            "id": s.id,
            "ticker": s.ticker,
            "quantity": s.quantity,
            "average_price": s.average_price,
            "current_price": round(current_price, 2),
            "profit_loss": round((current_price - s.average_price) * s.quantity, 2)
        })
    return results

# --- AI CHAT ENDPOINT ---

@app.post("/api/chat")
def chat(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    # 1. Gather context (Transactions & Portfolio)
    transactions = db.query(models.Transaction).all()
    portfolio = db.query(models.Portfolio).all()
    
    # 2. Create a simple summary string for the AI
    # We limit to last 50 transactions to keep context size reasonable
    recent_txs = transactions[-50:] if len(transactions) > 50 else transactions
    tx_summary = "\n".join([f"{t.date}: {t.description} - ${t.amount} ({t.category})" for t in recent_txs])
    stock_summary = "\n".join([f"{s.ticker}: {s.quantity} shares" for s in portfolio])
    
    context = f"RECENT TRANSACTIONS:\n{tx_summary}\n\nSTOCK PORTFOLIO:\n{stock_summary}"
    
    # 3. Get AI response
    response = chat_with_finances(request.query, context)
    
    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=True)
