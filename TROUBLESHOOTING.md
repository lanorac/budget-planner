# Troubleshooting Guide

## Common Issues and Solutions

### Backend Server Issues

#### 1. Pydantic Validation Errors
**Error**: `pydantic.errors.PydanticUserError: 'regex' is removed. use 'pattern' instead`

**Solution**: Update Pydantic schemas to use `pattern` instead of `regex`
```python
# ❌ Old (Pydantic v1)
include_toggle: str = Field(..., regex="^(on|off)$")

# ✅ New (Pydantic v2+)
include_toggle: str = Field(..., pattern="^(on|off)$")
```

#### 2. Database Column Name Errors
**Error**: `sqlite3.OperationalError: no such column: e.linked_liability_id`

**Solution**: Use correct column names from database schema
```sql
-- ❌ Wrong
e.linked_liability_id

-- ✅ Correct
e.linked_liab_id
```

**Common Column Name Mappings**:
- `monthly_payment` → `monthly_cost` (liabilities)
- `remaining_balance` → `principal` (liabilities)
- `linked_liability_id` → `linked_liab_id` (expenses, bills)

#### 3. Server Startup Issues
**Error**: `Error loading ASGI app. Could not import module "main"`

**Solutions**:
1. **Check directory**: Make sure you're in the `backend` directory
2. **Remove lifespan function**: Temporarily remove the lifespan function from main.py
3. **Check imports**: Verify all router imports are working

#### 4. Port Already in Use
**Error**: `[WinError 10013] An attempt was made to access a socket in a way forbidden by its access permissions`

**Solution**: Use a different port
```bash
python -m uvicorn main:app --host localhost --port 3000
```

### Frontend Issues

#### 1. Tailwind CSS PostCSS Errors
**Error**: `It looks like you're trying to use 'tailwindcss' directly as a PostCSS plugin`

**Solution**: 
1. Install correct Tailwind version: `npm install -D tailwindcss@^3.4.0`
2. Use standard PostCSS config:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### 2. API Connection Errors
**Error**: "Error Loading KPIs - Make sure the backend server is running on port 8000"

**Solutions**:
1. **Check backend port**: Update frontend API URLs to use correct port (3000)
2. **Verify backend is running**: Test with `curl http://localhost:3000/health`
3. **Check CORS**: Ensure backend allows frontend origin

#### 3. Package.json Not Found
**Error**: `Could not read package.json: Error: ENOENT: no such file or directory`

**Solution**: Navigate to correct directory
```bash
cd frontend  # Not cd ../frontend
npm run dev
```

### Development Environment Issues

#### 1. PowerShell Directory Navigation
**Issue**: Terminal starts in root directory, need to navigate to subdirectories

**Solution**: Always check current directory and navigate properly
```powershell
pwd  # Check current directory
cd backend  # Navigate to backend
cd frontend  # Navigate to frontend
```

#### 2. Virtual Environment Activation
**Issue**: Virtual environment activates in root directory

**Solution**: Activate virtual environment, then navigate to correct directory
```powershell
& f:/temp/github/budget-planner/.venv/Scripts/Activate.ps1
cd backend
python -m uvicorn main:app --host localhost --port 3000
```

#### 3. Background Process Management
**Issue**: Multiple Python processes running

**Solution**: Kill all Python processes and restart
```powershell
taskkill /F /IM python.exe
```

## Quick Fixes

### Backend Not Starting
1. Check you're in `backend` directory
2. Verify virtual environment is activated
3. Try different port (3000 instead of 8000)
4. Remove lifespan function temporarily

### Frontend Not Connecting to Backend
1. Update API URLs to use port 3000
2. Verify backend is running: `curl http://localhost:3000/health`
3. Check CORS configuration
4. Restart both servers

### Database Errors
1. Check column names match schema exactly
2. Verify foreign key relationships
3. Check data types in SQL queries
4. Use correct table names

### UI Issues
1. Downgrade Tailwind CSS to v3.4.0
2. Use standard PostCSS configuration
3. Clear browser cache
4. Restart development server

## Verification Commands

### Check Backend Status
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
```

### Check Frontend Status
```powershell
netstat -ano | findstr :5173
```

### Check Database Connection
```powershell
python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine); print('Database OK')"
```

### Check API Endpoints
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/kpis/monthly-totals?planner_id=550e8400-e29b-41d4-a716-446655440000&scenario=ALL" -UseBasicParsing
```

## Prevention Tips

1. **Always check current directory** before running commands
2. **Use exact column names** from database schema
3. **Test API endpoints** after making changes
4. **Keep Tailwind CSS at v3.4.0** for stability
5. **Use port 3000** for backend to avoid conflicts
6. **Reference DATABASE_SCHEMA_REFERENCE.md** for column names
