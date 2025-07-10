# Automatic Vercel Deployment Guide

This guide will help you set up automatic deployment to Vercel when code is pushed to the main branch.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Vercel CLI** (optional): `npm i -g vercel`

## Step 1: Create Vercel Project

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `hari8g/brandos-ai-platform`
4. Configure the project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`
5. Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Deploy and follow prompts
vercel --prod
```

## Step 2: Get Required Secrets

After creating your Vercel project, you'll need these values for GitHub Actions:

### Get Vercel Token
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create a new token with "Full Account" scope
3. Copy the token

### Get Project ID and Org ID
1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Scroll down to "General" section
4. Copy the "Project ID"
5. Copy the "Team ID" (this is your Org ID)

## Step 3: Configure GitHub Secrets

1. Go to your GitHub repository: `https://github.com/hari8g/brandos-ai-platform`
2. Click "Settings" tab
3. Click "Secrets and variables" → "Actions"
4. Add these repository secrets:

```
VERCEL_TOKEN = your_vercel_token_here
VERCEL_ORG_ID = your_team_id_here
VERCEL_PROJECT_ID = your_project_id_here
```

## Step 4: Test Deployment

1. Make a small change to your code
2. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "Test automatic deployment"
   git push
   ```
3. Check GitHub Actions: Go to your repo → "Actions" tab
4. Check Vercel deployment: Go to your Vercel dashboard

## Configuration Files

### GitHub Actions Workflow
- Location: `.github/workflows/deploy.yml`
- Triggers: Push to main branch, Pull requests to main
- Actions: Install dependencies, type check, build, deploy to Vercel

### Vercel Configuration
- Location: `frontend/vercel.json`
- Features: API proxy to backend, rewrites configuration

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check the build logs in GitHub Actions
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation passes

2. **Deployment Fails**
   - Verify Vercel secrets are correct
   - Check Vercel project settings
   - Ensure working directory is set to `./frontend`

3. **API Calls Fail**
   - Verify `vercel.json` has correct API proxy configuration
   - Check backend URL in proxy settings

### Debug Commands

```bash
# Test build locally
cd frontend
npm run build

# Test type checking
npm run type-check

# Check Vercel configuration
vercel --debug
```

## Environment Variables

If you need to add environment variables:

1. **For Vercel**: Add in Vercel dashboard → Settings → Environment Variables
2. **For GitHub Actions**: Add in repository secrets

## Monitoring

- **GitHub Actions**: Monitor deployment status in Actions tab
- **Vercel Dashboard**: Track deployments and performance
- **Vercel Analytics**: Monitor user behavior and performance

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Actions**: [docs.github.com/en/actions](https://docs.github.com/en/actions)
- **Vite Configuration**: [vitejs.dev/config](https://vitejs.dev/config) 