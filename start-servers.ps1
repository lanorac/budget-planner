# Budget Planner - Start Servers Script
# This script properly starts both backend and frontend servers

Write-Host "🚀 Starting Budget Planner Servers..." -ForegroundColor Green

# Get the script directory (project root)
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "$ProjectRoot\backend\main.py")) {
    Write-Host "❌ Error: backend\main.py not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$ProjectRoot\frontend\package.json")) {
    Write-Host "❌ Error: frontend\package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists
if (-not (Test-Path "$ProjectRoot\.venv")) {
    Write-Host "❌ Error: Virtual environment not found. Please run setup first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green

# Start Backend Server
Write-Host "🐍 Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\backend'; & '$ProjectRoot\.venv\Scripts\Activate.ps1'; python -m uvicorn main:app --host localhost --port 3000"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "⚛️ Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\frontend'; npm run dev"

Write-Host "🎉 Both servers are starting!" -ForegroundColor Green
Write-Host "📋 URLs:" -ForegroundColor Yellow
Write-Host "   Backend: http://localhost:3000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   API Docs: http://localhost:3000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this script (servers will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
