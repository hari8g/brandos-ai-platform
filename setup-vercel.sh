#!/bin/bash

echo "🚀 Setting up Vercel Deployment for Brandos AI Platform"
echo "======================================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

echo ""
echo "🔧 Step 1: Login to Vercel"
echo "Please run: vercel login"
echo "This will open your browser to authenticate with Vercel"
echo ""

echo "🔧 Step 2: Link your project to Vercel"
echo "Please run: cd frontend && vercel"
echo "This will create a new Vercel project and link it to your repository"
echo ""

echo "🔧 Step 3: Get your Vercel tokens"
echo "After linking, you'll need to add these secrets to your GitHub repository:"
echo ""
echo "1. Go to: https://github.com/hari8g/brandos-ai-platform/settings/secrets/actions"
echo "2. Add these repository secrets:"
echo "   - VERCEL_TOKEN: Get from https://vercel.com/account/tokens"
echo "   - VERCEL_ORG_ID: Found in your vercel.json or project settings"
echo "   - VERCEL_PROJECT_ID: Found in your vercel.json or project settings"
echo ""

echo "🔧 Step 4: Test deployment"
echo "After adding secrets, push to main branch to trigger deployment:"
echo "git push origin main"
echo ""

echo "📋 Quick Commands:"
echo "vercel login                    # Login to Vercel"
echo "cd frontend && vercel          # Link project"
echo "vercel env ls                  # List environment variables"
echo "vercel logs                    # View deployment logs"
echo ""

echo "✅ Once setup is complete, every push to main will automatically deploy to Vercel!" 