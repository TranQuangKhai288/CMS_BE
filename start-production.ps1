# Production startup script for Windows/PowerShell

Write-Host "🚀 Starting cms Backend in PRODUCTION mode..." -ForegroundColor Green
Write-Host "=================================="

# Check required environment variables
Write-Host "📋 Checking environment variables..." -ForegroundColor Cyan
$requiredVars = @("DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET")

foreach ($var in $requiredVars) {
    if (-not (Test-Path "env:$var")) {
        Write-Host "❌ ERROR: $var is not set!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ All required environment variables are set" -ForegroundColor Green

# Run database migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan
npx prisma migrate deploy

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

# Optional: Seed database if needed
# Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
# npm run prisma:seed

Write-Host "✅ Database setup complete" -ForegroundColor Green

# Start the application
Write-Host "🎯 Starting application..." -ForegroundColor Cyan
node dist/main.js
