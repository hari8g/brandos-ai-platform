#!/bin/bash
echo "🗄️ Setting up database..."
alembic upgrade head
echo "✅ Database setup complete" 