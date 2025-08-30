from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Budget Planner API",
    description="A comprehensive budget planning and scenario simulation API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Budget Planner API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "budget-planner-api"}

@app.get("/api/v1/assets")
async def get_assets():
    return {"assets": []}
