# Start the Backend Server (FastAPI)
Write-Host "Starting Backend FastAPI Server on Port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; if (!(Test-Path venv)) { python -m venv venv }; .\venv\Scripts\activate; pip install -r requirements.txt; uvicorn app.main:app --reload`""

# Start the Frontend Server (Vite React)
Write-Host "Starting Frontend React Server on Port 5173..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`""

Write-Host "Servers are starting up in new windows." -ForegroundColor Yellow
Write-Host "Frontend will be available at http://localhost:5173"
Write-Host "Backend API docs available at http://localhost:8000/docs"
