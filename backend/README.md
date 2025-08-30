# Budget Planner Backend

FastAPI backend for the Budget Planner application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
Create a `.env` file with:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/budget_planner
ENVIRONMENT=development
```

3. Run the database schema:
```bash
psql -d budget_planner -f ../schema.sql
```

4. Start the development server:
```bash
python main.py
```

The API will be available at http://localhost:8000

## API Documentation

Once running, visit http://localhost:8000/docs for interactive API documentation.
