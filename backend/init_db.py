"""
Run this script once to create all database tables.

python init_db.py
"""

from app.database import Base, engine
import app.models  # noqa: F401

Base.metadata.create_all(bind=engine)
print("All tables created successfully.")