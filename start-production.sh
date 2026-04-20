#!/bin/bash
# Production startup script for Render deployment

set -e # Exit on error

echo "🚀 Starting cms Backend in PRODUCTION mode..."
echo "=================================="

# Check required environment variables
echo "📋 Checking environment variables..."
required_vars=("DATABASE_URL" "JWT_SECRET" "JWT_REFRESH_SECRET")

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ ERROR: $var is not set!"
    exit 1
  fi
done

echo "✅ All required environment variables are set"

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client (in case it's not generated)
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Optional: Seed database if needed (uncomment if you want initial data)
# echo "🌱 Seeding database..."
# npm run prisma:seed

echo "✅ Database setup complete"

# Start the application
echo "🎯 Starting application..."
exec node dist/main.js
