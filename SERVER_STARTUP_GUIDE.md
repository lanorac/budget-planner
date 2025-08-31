# Server Startup Guide

## Proper Way to Start Servers

### 1. Check Current Directory
```powershell
# Always check where you are first
pwd
# or
Get-Location
```

### 2. Navigate to Project Root
```powershell
# If you're in frontend or backend, go to project root
cd ..
# Verify you're in the right place
dir
# Should show: backend, frontend, .venv folders
```

### 3. Start Backend Server
```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment (from project root)
& ..\.venv\Scripts\Activate.ps1

# Start the server
python -m uvicorn main:app --host localhost --port 3000
```

### 4. Start Frontend Server (in new terminal)
```powershell
# Navigate to frontend directory
cd frontend

# Start the development server
npm run dev
```

## Quick Start Script

Use the provided `start-servers.ps1` script for automatic startup:

```powershell
# From project root
.\start-servers.ps1
```

## Common Mistakes to Avoid

❌ **Wrong**: `cd backend; cd backend` (double navigation)
❌ **Wrong**: Running from wrong directory
❌ **Wrong**: Not activating virtual environment
❌ **Wrong**: Using wrong paths for virtual environment

✅ **Correct**: Check directory first, then navigate
✅ **Correct**: Use relative paths from project root
✅ **Correct**: Activate virtual environment before running Python
✅ **Correct**: Verify project structure before starting

## Verification Steps

1. **Check Backend**: http://localhost:3000/health
2. **Check Frontend**: http://localhost:5173
3. **Check API Docs**: http://localhost:3000/docs

## Troubleshooting

### Backend Issues
- Ensure you're in `backend` directory
- Ensure virtual environment is activated
- Check if `main.py` exists
- Verify port 3000 is available

### Frontend Issues
- Ensure you're in `frontend` directory
- Check if `package.json` exists
- Verify `node_modules` is installed
- Check if port 5173 is available
