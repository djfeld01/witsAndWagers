#!/bin/bash

echo "🚀 Deploying #Trivia to Vercel"
echo "===================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing..."
    npm install -g vercel
    echo ""
fi

# Run tests first
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Tests failed! Please fix errors before deploying."
    exit 1
fi
echo "✅ All tests passed!"
echo ""

# Check if git repo exists
if [ ! -d .git ]; then
    echo "⚠️  No git repository found."
    echo "   It's recommended to use git for deployments."
    echo ""
    read -p "Continue without git? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Visit your deployment URL"
echo "   2. Test creating a game"
echo "   3. Test joining with multiple devices"
echo "   4. Verify real-time updates work"
echo ""
echo "💡 Tip: Set up environment variables in Vercel dashboard if not done yet"
echo "   DATABASE_URL"
echo "   NEXT_PUBLIC_SUPABASE_URL"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY"
