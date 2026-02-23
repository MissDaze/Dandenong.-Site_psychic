#!/bin/bash
# ================================================
# RAILWAY DEPLOYMENT HELPER
# ================================================
# Run this script after cloning to verify setup

echo "================================================"
echo "  Best Astrologer Dandenong - Railway Setup"
echo "================================================"
echo ""

# Check for required files
echo "Checking required files..."
files=("Dockerfile" "railway.json" "backend/server.py" "backend/requirements.txt" "frontend/package.json")
all_found=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
        all_found=false
    fi
done

echo ""

if [ "$all_found" = true ]; then
    echo "All required files present!"
else
    echo "ERROR: Some files are missing. Please check your repository."
    exit 1
fi

echo ""
echo "================================================"
echo "  REQUIRED ENVIRONMENT VARIABLES FOR RAILWAY"
echo "================================================"
echo ""
echo "Set these in Railway → Your Service → Variables:"
echo ""
echo "  MONGO_URL       = mongodb+srv://user:pass@cluster.mongodb.net/db"
echo "  DB_NAME         = astrologer_db"
echo "  GROQ_API_KEY    = gsk_your_key_here"
echo "  JWT_SECRET      = $(python3 -c 'import secrets; print(secrets.token_hex(32))' 2>/dev/null || echo 'run: python -c "import secrets; print(secrets.token_hex(32))"')"
echo "  CORS_ORIGINS    = * (or your domain)"
echo ""
echo "================================================"
echo "  GET FREE API KEYS"
echo "================================================"
echo ""
echo "MongoDB Atlas (Free M0 Cluster):"
echo "  → https://mongodb.com/atlas"
echo ""
echo "Groq AI (Free ~500k tokens/day):"
echo "  → https://console.groq.com"
echo ""
echo "================================================"
echo "  DEPLOYMENT STEPS"
echo "================================================"
echo ""
echo "1. Push this repo to GitHub"
echo "2. Go to railway.app → New Project → Deploy from GitHub"
echo "3. Add environment variables (see above)"
echo "4. Wait for build to complete"
echo "5. Visit your-app.up.railway.app/api/init-admin"
echo "6. Login at /admin with admin / admin123"
echo ""
echo "Done! Your site will be live with no third-party branding."
echo ""
