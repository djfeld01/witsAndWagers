#!/bin/bash

echo "🎮 Wits & Wagers - Quick Start"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo ""
    echo "Please choose a setup option:"
    echo ""
    echo "Option 1: Supabase Cloud (Recommended)"
    echo "  1. Go to https://supabase.com and create a free account"
    echo "  2. Create a new project"
    echo "  3. Get your connection details from Settings"
    echo "  4. Update .env.local with your credentials"
    echo ""
    echo "Option 2: Local with Docker"
    echo "  1. Install Docker Desktop from https://docker.com"
    echo "  2. Run: supabase start"
    echo "  3. Copy the connection details to .env.local"
    echo ""
    echo "See GETTING_STARTED.md for detailed instructions"
    exit 1
fi

echo "✓ Found .env.local"
echo ""

# Check if DATABASE_URL is set
if grep -q "your-supabase-url" .env.local || grep -q "user:password@localhost" .env.local; then
    echo "⚠️  Database not configured yet!"
    echo ""
    echo "Please update .env.local with your database credentials."
    echo "See GETTING_STARTED.md for setup options."
    exit 1
fi

echo "✓ Database configured"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✓ Dependencies installed"
echo ""

# Push database schema
echo "🗄️  Pushing database schema..."
npm run db:push
echo ""

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed
echo ""

# Run tests
echo "🧪 Running tests..."
npm test
echo ""

echo "✅ Setup complete!"
echo ""
echo "🚀 Starting development server..."
echo ""
echo "Open http://localhost:3000 in your browser"
echo ""

npm run dev
