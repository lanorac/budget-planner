# Budget Planner - Quick Setup Script
# Run this script to automatically set up the project

Write-Host "🚀 Budget Planner - Quick Setup Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "   Expected: budget-planner/setup.ps1" -ForegroundColor Yellow
    exit 1
}

# Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Cyan

$pythonVersion = python --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python not found. Please install Python 3.11+ from python.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green

$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm not found. Please install Node.js 18+ from nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm: $npmVersion" -ForegroundColor Green

# Setup Backend
Write-Host "`n🐍 Setting up Backend..." -ForegroundColor Cyan

# Create virtual environment if it doesn't exist
if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
cd backend
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}

# Create database
Write-Host "Setting up database..." -ForegroundColor Yellow
python create_tables.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create database tables" -ForegroundColor Red
    exit 1
}

# Seed data
Write-Host "Seeding sample data..." -ForegroundColor Yellow
python seed_data.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed sample data" -ForegroundColor Red
    exit 1
}

cd ..

# Setup Frontend
Write-Host "`n⚛️ Setting up Frontend..." -ForegroundColor Cyan

cd frontend

# Install Node.js dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Node.js dependencies" -ForegroundColor Red
    exit 1
}

cd ..

# Success message
Write-Host "`n🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the backend server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   & ..\.venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   python -m uvicorn main:app --host localhost --port 3000" -ForegroundColor Gray

Write-Host "`n2. Start the frontend server (in a new terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray

Write-Host "`n3. Open your browser:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "   Backend API: http://localhost:3000/docs" -ForegroundColor Gray

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Installation Guide: INSTALLATION_GUIDE.md" -ForegroundColor Gray
Write-Host "   - Troubleshooting: TROUBLESHOOTING.md" -ForegroundColor Gray
Write-Host "   - Development Tasks: DEVELOPMENT_TASKS.md" -ForegroundColor Gray

Write-Host "`n🚀 Happy coding!" -ForegroundColor Green
