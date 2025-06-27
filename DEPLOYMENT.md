# 🚀 Vercel Deployment Guide for BrandOS AI Platform

## Prerequisites
- Vercel account (free at vercel.com)
- GitHub account
- OpenAI API key

## Step-by-Step Deployment Instructions

### Step 1: Prepare Your Repository
1. Make sure your code is committed to a GitHub repository
2. Ensure these files are present in your repository:
   - `vercel.json` (Vercel configuration)
   - `requirements.txt` (Python dependencies)
   - `api/index.py` (API serverless function)
   - `frontend/package.json` (Frontend dependencies)

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing your BrandOS AI Platform

### Step 3: Configure Environment Variables
1. In the Vercel project settings, go to "Environment Variables"
2. Add the following environment variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key
   - **Environment**: Production, Preview, Development (select all)

### Step 4: Configure Build Settings
1. In the project settings, go to "Build & Development Settings"
2. Set the following:
   - **Framework Preset**: Other
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`

### Step 5: Deploy
1. Click "Deploy" in Vercel
2. Wait for the build to complete (this may take 2-3 minutes)
3. Your app will be available at the provided Vercel URL

### Step 6: Test Your Deployment
1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Test the frontend interface
3. Test the API endpoints:
   - `https://your-app.vercel.app/api/v1/health`
   - `https://your-app.vercel.app/api/v1/query/assess`
   - `https://your-app.vercel.app/api/v1/formulation/generate`

## Environment Variables Required
- `OPENAI_API_KEY`: Your OpenAI API key for AI-powered formulations

## Project Structure for Vercel
```
brandos_ai_platform/
├── vercel.json              # Vercel configuration
├── requirements.txt         # Python dependencies
├── api/
│   └── index.py            # API serverless function
├── frontend/
│   ├── package.json        # Frontend dependencies
│   ├── src/                # React source code
│   └── dist/               # Built frontend (generated)
└── backend/                # Backend code (for reference)
```

## Troubleshooting

### Build Fails
- Check Vercel build logs for specific errors
- Ensure all dependencies are in `requirements.txt`
- Verify `package.json` has correct build scripts

### API Not Working
- Check environment variables are set correctly
- Verify the `api/index.py` file is present
- Test API endpoints individually

### Frontend Not Loading
- Check if `frontend/dist` directory is generated
- Verify `vercel.json` routing configuration
- Ensure build command completes successfully

## Custom Domain (Optional)
1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Configure DNS settings as instructed by Vercel

## Monitoring
- Use Vercel Analytics to monitor performance
- Check Function Logs for API debugging
- Monitor API usage and costs

## Security Notes
- Your OpenAI API key is stored securely in Vercel environment variables
- The API key is not exposed in the frontend code
- All API calls are made server-side in the Vercel function

## Cost Considerations
- Vercel has a generous free tier
- Serverless function calls are billed per invocation
- Monitor your usage in the Vercel dashboard 