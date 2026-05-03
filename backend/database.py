import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Get the absolute path of the 'backend' directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. Create a full path for the database file
DB_PATH = os.path.join(BASE_DIR, "sql_app.db")

# 3. Use the absolute path in the connection string
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
