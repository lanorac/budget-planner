# Budget Planner - Installation Guide

## Prerequisites

### Required Software
- **Python 3.11+** (Download from [python.org](https://www.python.org/downloads/))
- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **Git** (Download from [git-scm.com](https://git-scm.com/))

### Verify Installations
```powershell
# Check Python version
python --version

# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

## Project Setup

### 1. Clone the Repository
```powershell
# Clone the repository
git clone https://github.com/lanorac/budget-planner.git

# Navigate to project directory
cd budget-planner
```

### 2. Backend Setup

#### Create Virtual Environment
```powershell
# Create virtual environment
python -m venv .venv

# Activate virtual environment
& .\.venv\Scripts\Activate.ps1
```

#### Install Python Dependencies
```powershell
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt
```

#### Database Setup
```powershell
# Create database tables
python create_tables.py

# Seed sample data
python seed_data.py
```

#### Start Backend Server
```powershell
# Start the backend server
python -m uvicorn main:app --host localhost --port 3000
```

**Backend should now be running on:** http://localhost:3000

### 3. Frontend Setup

#### Open New Terminal Window
```powershell
# Navigate to project root
cd F:\temp\github\budget-planner

# Navigate to frontend directory
cd frontend
```

#### Install Node.js Dependencies
```powershell
# Install dependencies
npm install
```

#### Start Frontend Development Server
```powershell
# Start the development server
npm run dev
```

**Frontend should now be running on:** http://localhost:5173

## Verification Steps

### 1. Check Backend Health
```powershell
# Test backend health endpoint
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
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
```powershell
# If virtual environment activation fails
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again
& .\.venv\Scripts\Activate.ps1
```

#### 2. Port Already in Use
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill process if needed
taskkill /F /PID <PID_NUMBER>
```

#### 3. Node.js Dependencies Issues
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

#### 4. Database Issues
```powershell
# If database file is corrupted, delete and recreate
Remove-Item backend\budget_planner.db
python create_tables.py
python seed_data.py
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
```powershell
# Terminal 1: Backend
cd backend
& ..\.venv\Scripts\Activate.ps1
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
