FROM python:3.10-slim

# 1. Install OS build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      ninja-build \
      cmake \
      pkg-config && \
    rm -rf /var/lib/apt/lists/*

# 2. Create working dir
WORKDIR /app

# 3. Copy and install Python deps
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt uvicorn[standard]

# 4. Copy your code
COPY . .

# 5. Expose port and define startup
ENV PORT=8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]