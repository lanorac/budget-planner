from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.database import engine
from app.models import Base
from app.routers import assets, liabilities, income, expenses, bills, categories, settings, kpis, scenarios

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Budget Planner API",
    description="A comprehensive budget planning and scenario simulation API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(assets.router, prefix="/api/v1", tags=["assets"])
app.include_router(liabilities.router, prefix="/api/v1", tags=["liabilities"])
app.include_router(income.router, prefix="/api/v1", tags=["income"])
app.include_router(expenses.router, prefix="/api/v1", tags=["expenses"])
app.include_router(bills.router, prefix="/api/v1", tags=["bills"])
app.include_router(categories.router, prefix="/api/v1", tags=["categories"])
app.include_router(settings.router, prefix="/api/v1", tags=["settings"])
app.include_router(kpis.router, prefix="/api/v1", tags=["kpis"])
app.include_router(scenarios.router, prefix="/api/v1", tags=["scenarios"])

@app.get("/")
async def root():
    return {"message": "Budget Planner API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "budget-planner-api"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)
