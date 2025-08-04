# Render Deployment Guide

This guide will help you deploy your full-stack Brandos AI Platform to Render.

## 🏗️ Architecture Overview

Your application consists of:
- **Backend**: FastAPI Python API (deployed as Web Service)
- **Frontend**: React/Vite SPA (deployed as Static Site)

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Prepare your API keys and secrets

## 🚀 Deployment Options

### Option A: Blueprint Deployment (Recommended)

This deploys both services automatically using the `render.yaml` configuration.

1. **Connect Repository to Render**:
   - Go to [render.com](https://render.com) dashboard
   - Click "New" → "Blueprint"
   - Connect your GitHub repository: `hari8g/brandos-ai-platform`
   - Render will automatically detect the `render.yaml` file

2. **Review Services**:
   - **brandos-api**: FastAPI backend web service
   - **brandos-frontend**: React frontend static site

3. **Deploy**:
   - Click "Apply" to deploy both services
   - Monitor deployment progress in the dashboard

### Option B: Manual Service Creation

If you prefer to create services manually:

#### Backend Web Service

1. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `brandos-api`
     - **Runtime**: Python 3
     - **Build Command**: `cd backend && pip install -r requirements.txt`
     - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free (or upgrade as needed)

2. **Environment Variables**:
   ```
   PYTHON_VERSION = 3.11.0
   PORT = 10000
   ENVIRONMENT = production
   ```

#### Frontend Static Site

1. **Create Static Site**:
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `brandos-frontend`
     - **Build Command**: `cd frontend && npm ci && npm run build`
     - **Publish Directory**: `frontend/dist`

2. **Configure Redirects**:
   Add these redirects in the Static Site settings:
   ```
   /api/* -> https://your-api-service.onrender.com/api/* (proxy)
   /* -> /index.html (rewrite)
   ```

## ⚙️ Configuration Files

### render.yaml (Blueprint Configuration)

Located in the root directory, this file defines both services:

```yaml
services:
  # Backend API Service
  - type: web
    name: brandos-api
    runtime: python
    buildCommand: "cd backend && pip install -r requirements.txt"
    startCommand: "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    
  # Frontend Static Site  
  - type: static
    name: brandos-frontend
    buildCommand: "cd frontend && npm ci && npm run build"
    staticPublishPath: "./frontend/dist"
```

### Health Check Endpoint

The backend includes a health check endpoint at `/health` for Render monitoring:

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Brandos AI Platform API is running"}
```

## 🔐 Environment Variables

### Required for Backend Service

Add these in your Render backend service environment variables:

```bash
# Core Settings
ENVIRONMENT=production
PORT=10000

# API Keys (Add your actual keys)
OPENAI_API_KEY=your_openai_key_here
# Add other API keys as needed
```

### Required for Frontend Service

The frontend will automatically connect to your backend via the proxy configuration.

## 🔄 Deployment Process

### Automatic Deployment

1. **Push to GitHub**: Any push to main branch triggers automatic deployment
2. **Build Process**: 
   - Backend: Installs Python dependencies, starts FastAPI server
   - Frontend: Installs npm dependencies, builds React app, serves static files
3. **Health Checks**: Render monitors the `/health` endpoint

### Manual Deployment

1. Go to your service dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Monitor build logs for any issues

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails - Backend**:
   ```bash
   # Check Python version
   python --version  # Should be 3.11+
   
   # Test dependencies locally
   cd backend
   pip install -r requirements.txt
   ```

2. **Build Fails - Frontend**:
   ```bash
   # Test build locally
   cd frontend
   npm ci
   npm run build
   ```

3. **API Connection Issues**:
   - Verify the frontend proxy configuration
   - Check that backend service URL is correct in redirects
   - Ensure CORS is properly configured

4. **Health Check Failing**:
   - Verify `/health` endpoint is accessible
   - Check if FastAPI server is starting properly
   - Review backend service logs

### Debug Commands

```bash
# Test backend locally
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Test frontend locally
cd frontend
npm run dev

# Check build outputs
cd frontend && npm run build
cd backend && python -c "import app.main; print('Import successful')"
```

## 📊 Monitoring

### Render Dashboard

- **Deployments**: Track deployment history and status
- **Logs**: View real-time application logs
- **Metrics**: Monitor CPU, RAM, and bandwidth usage
- **Custom Domains**: Set up your own domain

### Health Monitoring

- **Automatic**: Render monitors `/health` endpoint
- **Manual**: Check service status in dashboard
- **Alerts**: Set up notifications for service issues

## 🌐 Custom Domains

### Add Custom Domain

1. **Backend Service**:
   - Go to Settings → Custom Domains
   - Add your API domain (e.g., `api.yourdomain.com`)

2. **Frontend Service**:
   - Go to Settings → Custom Domains  
   - Add your main domain (e.g., `yourdomain.com`)

3. **Update Frontend Configuration**:
   - Update proxy URLs to use your custom API domain
   - Update CORS settings in backend

## 📈 Scaling & Performance

### Free Tier Limitations

- **Web Services**: Sleep after 15 minutes of inactivity
- **Static Sites**: Always available
- **Bandwidth**: 100GB/month
- **Build Time**: 500 minutes/month

### Upgrade Options

- **Starter Plan**: $7/month - No sleeping, 400 build minutes
- **Standard Plan**: $25/month - More resources, priority support
- **Pro Plan**: $85/month - High performance, advanced features

## 🔒 Security

### Environment Variables

- Store all secrets in Render environment variables
- Never commit API keys to repository
- Use different keys for production vs development

### HTTPS

- Render provides free SSL certificates
- All traffic is automatically encrypted
- Custom domains get SSL certificates

## 📚 Additional Resources

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **FastAPI Deployment**: [fastapi.tiangolo.com/deployment](https://fastapi.tiangolo.com/deployment/)
- **Vite Deployment**: [vitejs.dev/guide/static-deploy](https://vitejs.dev/guide/static-deploy.html)

## 🆘 Support

- **Render Support**: Available in dashboard chat
- **Community**: [Render Community Forum](https://community.render.com)
- **Status Page**: [status.render.com](https://status.render.com)

---

## 🎯 Quick Start Summary

1. **Prepare**: Ensure `render.yaml` is in your repository root
2. **Deploy**: Go to Render → New Blueprint → Connect repository
3. **Configure**: Add environment variables for backend service
4. **Monitor**: Check deployment status and logs
5. **Test**: Verify both frontend and backend are working
6. **Scale**: Upgrade plans as your application grows

Your Brandos AI Platform will be live at:
- **Frontend**: `https://brandos-frontend.onrender.com`
- **Backend**: `https://brandos-api.onrender.com` 