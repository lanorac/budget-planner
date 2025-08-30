#!/bin/bash

echo "🚀 Budget Planner - Ubuntu Quick Setup Script"
echo "============================================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Expected: budget-planner/setup.sh"
    exit 1
fi

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.11+"
    exit 1
fi
echo "✅ Python3: $(python3 --version)"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ npm: $(npm --version)"

# Setup Backend
echo "🐍 Setting up Backend..."

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# Create database
echo "Setting up database..."
python create_tables.py
if [ $? -ne 0 ]; then
    echo "❌ Failed to create database tables"
    exit 1
fi

# Seed data
echo "Seeding sample data..."
python seed_data.py
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed sample data"
    exit 1
fi

cd ..

# Setup Frontend
echo "⚛️ Setting up Frontend..."

cd frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

cd ..

# Success message
echo "🎉 Setup completed successfully!"
echo "============================================="

echo "📋 Next steps:"
echo "1. Start the backend server:"
echo "   cd backend"
echo "   source ../.venv/bin/activate"
echo "   python -m uvicorn main:app --host localhost --port 3000"

echo ""
echo "2. Start the frontend server (in a new terminal):"
echo "   cd frontend"
echo "   npm run dev"

echo ""
echo "3. Open your browser:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3000/docs"

echo ""
echo "📚 Documentation:"
echo "   - Installation Guide: INSTALLATION_GUIDE_UBUNTU.md"
echo "   - Troubleshooting: TROUBLESHOOTING.md"
echo "   - Development Tasks: DEVELOPMENT_TASKS.md"

echo ""
echo "🚀 Happy coding!"
