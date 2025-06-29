"""
Domain models for the application.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    job_role = Column(String, nullable=False)
    brand_name = Column(String, nullable=False)
    access_granted = Column(Boolean, default=False)
    user_id = Column(String, unique=True, index=True)  # For session management
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

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
