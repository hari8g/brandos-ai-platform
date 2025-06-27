"""
Shared database client for MLOps pipelines.
"""
import psycopg2
from sqlalchemy import create_engine
import os

def get_postgres_client():
    """Get PostgreSQL client connection."""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'brandos_ai'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'password')
    )

def get_sqlalchemy_engine():
    """Get SQLAlchemy engine."""
    return create_engine(
        f"postgresql://{os.getenv('DB_USER', 'postgres')}:{os.getenv('DB_PASSWORD', 'password')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'brandos_ai')}"
    )
