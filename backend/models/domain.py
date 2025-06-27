"""
Domain models for the application.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from core.database import Base

class Formulation(Base):
    __tablename__ = "formulations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    ingredients = Column(Text)  # JSON string
    estimated_cost = Column(Float)
    predicted_ph = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
