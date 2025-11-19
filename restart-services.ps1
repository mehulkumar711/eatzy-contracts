# Kill all Node processes
Write-Host "Stopping all Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start backend services
Write-Host "`nStarting backend services..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run start:dev auth-service order-service"

# Wait for backend to initialize
Start-Sleep -Seconds 5

# Start admin panel
Write-Host "Starting admin panel..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\apps\admin-panel'; npm run dev"

Write-Host "`n✅ Services started in separate windows!" -ForegroundColor Cyan
Write-Host "Admin Panel: http://localhost:3005" -ForegroundColor Cyan
Write-Host "Auth Service: http://localhost:3001" -ForegroundColor Cyan
