#!/bin/bash

# Hennie's Photos - Quick Deploy to Render
# Run this script to deploy automatically

echo "🚀 Hennie's Photos - Render Deployment"
echo "======================================"
echo ""

# Check if .env file exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo ""
    echo "Create .env.local with your Supabase keys:"
    echo "  SUPABASE_URL=your_url"
    echo "  SUPABASE_KEY=your_key"
    echo "  SUPABASE_ANON_KEY=your_anon_key"
    echo "  NODE_ENV=production"
    echo "  PORT=3000"
    exit 1
fi

echo "✅ Found .env.local"
echo ""

# Check if git is configured
if ! git config user.name > /dev/null; then
    echo "⚠️  Git not configured. Setting up..."
    git config user.name "Hennie"
    git config user.email "boshoffhennie499@gmail.com"
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🧪 Testing local server..."
timeout 5 npm run dev || true

echo ""
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deployment update" 2>/dev/null || true
git push origin main

echo ""
echo "======================================"
echo "✅ NEXT STEPS:"
echo "======================================"
echo ""
echo "1. Go to: https://render.com"
echo "2. Sign in with GitHub"
echo "3. Click: New + → Web Service"
echo "4. Select: hennies-photos-supabase"
echo "5. Fill in:"
echo "   - Name: hennies-photos-api"
echo "   - Build: npm install"
echo "   - Start: node server.js"
echo "6. Click Advanced → Add Environment Variables:"
echo ""
echo "   SUPABASE_URL=$(grep SUPABASE_URL .env.local | cut -d'=' -f2)"
echo "   SUPABASE_KEY=$(grep SUPABASE_KEY .env.local | cut -d'=' -f2)"
echo "   SUPABASE_ANON_KEY=$(grep SUPABASE_ANON_KEY .env.local | cut -d'=' -f2)"
echo "   NODE_ENV=production"
echo "   PORT=3000"
echo ""
echo "7. Click: Create Web Service"
echo ""
echo "Your API URL will be shown in 2-3 minutes!"
echo ""
