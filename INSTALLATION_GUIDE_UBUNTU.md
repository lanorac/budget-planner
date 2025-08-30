# Budget Planner - Ubuntu Installation Guide

## Prerequisites

### Required Software
- **Python 3.11+** (Install via package manager or python.org)
- **Node.js 18+** (Install via package manager or nodejs.org)
- **Git** (Install via package manager)

### Install Prerequisites
```bash
# Update package list
sudo apt update

# Install Python 3.11+ and pip
sudo apt install python3 python3-pip python3-venv

# Install Node.js 18+ and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Install Git
sudo apt install git
```

### Verify Installations
```bash
# Check Python version
python3 --version

# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

## Project Setup

### 1. Clone the Repository
```bash
# Clone the repository
git clone https://github.com/lanorac/budget-planner.git

# Navigate to project directory
cd budget-planner
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate
```

#### Install Python Dependencies
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt
```

#### Database Setup
```bash
# Create database tables
python create_tables.py

# Seed sample data
python seed_data.py
```

#### Start Backend Server
```bash
# Start the backend server
python -m uvicorn main:app --host localhost --port 3000
```

**Backend should now be running on:** http://localhost:3000

### 3. Frontend Setup

#### Open New Terminal Window
```bash
# Navigate to project root
cd /path/to/budget-planner

# Navigate to frontend directory
cd frontend
```

#### Install Node.js Dependencies
```bash
# Install dependencies
npm install
```

#### Start Frontend Development Server
```bash
# Start the development server
npm run dev
```

**Frontend should now be running on:** http://localhost:5173

## Verification Steps

### 1. Check Backend Health
```bash
# Test backend health endpoint
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "budget-planner-api"
}
```

### 2. Check API Documentation
Open in browser: http://localhost:3000/docs

### 3. Check Frontend
Open in browser: http://localhost:5173

You should see:
- Beautiful glass morphism UI
- KPI cards with financial data
- Assets table with sample data
- Modern responsive design

## Troubleshooting

### Common Issues

#### 1. Python Virtual Environment Issues
```bash
# If virtual environment activation fails
chmod +x .venv/bin/activate

# Then try again
source .venv/bin/activate
```

#### 2. Port Already in Use
```bash
# Check what's using port 3000
sudo netstat -tulpn | grep :3000

# Kill process if needed
sudo kill -9 <PID_NUMBER>
```

#### 3. Node.js Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### 4. Database Issues
```bash
# If database file is corrupted, delete and recreate
rm backend/budget_planner.db
python create_tables.py
python seed_data.py
```

#### 5. Permission Issues
```bash
# If you get permission errors
sudo chown -R $USER:$USER /path/to/budget-planner
chmod -R 755 /path/to/budget-planner
```

### Backend Not Starting
1. Ensure you're in the `backend` directory
2. Verify virtual environment is activated
3. Check all dependencies are installed
4. Try different port: `python -m uvicorn main:app --host localhost --port 3001`

### Frontend Not Connecting to Backend
1. Verify backend is running on port 3000
2. Check API URLs in frontend code use correct port
3. Ensure CORS is properly configured
4. Check browser console for errors

## Development Workflow

### Starting Development
```bash
# Terminal 1: Backend
cd backend
source ../.venv/bin/activate
python -m uvicorn main:app --host localhost --port 3000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Stopping Servers
- **Backend**: Press `Ctrl+C` in backend terminal
- **Frontend**: Press `Ctrl+C` in frontend terminal

### Making Changes
- Backend changes auto-reload with `--reload` flag
- Frontend changes auto-reload with Vite dev server
- Database changes require manual restart

## Project Structure

```
budget-planner/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API endpoints
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── main.py             # FastAPI app
│   ├── requirements.txt    # Python dependencies
│   └── seed_data.py        # Sample data
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind CSS config
├── .venv/                  # Python virtual environment
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```

## Environment Variables

### Backend (.env file in backend directory)
```env
DATABASE_URL=sqlite:///./budget_planner.db
DEBUG=True
```

### Frontend (.env file in frontend directory)
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Dependencies

### Backend Dependencies (requirements.txt)
```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
python-dotenv==1.0.0
```

### Frontend Dependencies (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.8.4",
    "axios": "^1.6.2",
    "react-router-dom": "^6.20.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
```

## Quick Setup Script

Create a `setup.sh` script for automated setup:

```bash
#!/bin/bash

echo "🚀 Budget Planner - Ubuntu Quick Setup Script"
echo "============================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.11+"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ All prerequisites found"

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

# Create database
echo "Setting up database..."
python create_tables.py

# Seed data
echo "Seeding sample data..."
python seed_data.py

cd ..

# Setup Frontend
echo "⚛️ Setting up Frontend..."

cd frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

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
```

Make it executable:
```bash
chmod +x setup.sh
./setup.sh
```

## Next Steps

After successful installation:

1. **Explore the Application**: Visit http://localhost:5173
2. **Check API Documentation**: Visit http://localhost:3000/docs
3. **Review Documentation**: Read `DEVELOPMENT_TASKS.md` and `DATABASE_SCHEMA_REFERENCE.md`
4. **Start Development**: Follow the development workflow above

## Support

If you encounter issues:

1. Check the `TROUBLESHOOTING.md` file
2. Verify all prerequisites are installed correctly
3. Ensure you're using the correct directory paths
4. Check that both servers are running on the correct ports

## Version Information

- **Current Version**: v0.1.0-dev
- **Python**: 3.11+
- **Node.js**: 18+
- **Backend**: FastAPI with SQLAlchemy
- **Frontend**: React with TypeScript and Tailwind CSS
- **OS**: Ubuntu 20.04+ (or any Linux distribution)
