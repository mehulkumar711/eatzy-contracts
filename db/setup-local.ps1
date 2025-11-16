$ErrorActionPreference = "Stop"
Write-Host "========== EATZY LOCAL DATABASE SETUP (v1.15) =========="
Write-Host ""
Write-Host "[1/5] Destroying old containers and stale volumes..."
# Temporarily allow errors for 'down'
Invoke-Command {
    $ErrorActionPreference = "Continue"
    docker compose down --volumes 2>$null
}
if (Test-Path -Path "./data") {
    Write-Host "      Nuking stale './data' folder..."
    Remove-Item -Recurse -Force ./data -ErrorAction SilentlyContinue
}

Write-Host "[2/5] Starting Docker containers (waiting for healthcheck)..."
# Use Invoke-Command to trap Docker's noisy stderr
Invoke-Command {
    $ErrorActionPreference = "Continue"
    docker compose up -d --wait 2>$null
}
if ($LASTEXITCODE -ne 0) {
    throw "Docker compose failed. Container healthcheck failed. Run 'docker logs eatzy_postgres' for details."
}

Write-Host "[3/5] ✅ PostgreSQL container is healthy."
Write-Host "      Now verifying application database is ready..."

# STAGE 1: Check service health via socket (no password needed)
$retries = 0
$dbReady = $false
do {
    Start-Sleep 2
    Write-Host "." -NoNewline
    
    # Use 'pg_isready' without '-h' to use the socket
    docker exec eatzy_postgres pg_isready -U postgres -d postgres 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $dbReady = $true
        break
    }
    $retries++
} until ($retries -gt 20)

Write-Host ""
if (-not $dbReady) { 
    throw "PostgreSQL Service (socket) never became ready (Timed out)." 
}
Write-Host "      ✅ PostgreSQL Service (socket) is ready."

# STAGE 2: Check application DB via TCP/IP (simulates app)
$retries = 0
$dbReady = $false
do {
    Start-Sleep 2
    Write-Host "." -NoNewline
    
    # Use TCP/IP + Password
    docker exec -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db -c "SELECT 1;" 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $dbReady = $true
        break
    }
    $retries++
} until ($retries -gt 20)

Write-Host ""
if (-not $dbReady) { 
    throw "Application database 'eatzy_db' (TCP) never became ready (Timed out)." 
}
Write-Host "      ✅ Application database (TCP) is ready."
Start-Sleep 2

Write-Host "[4/5] Running Migrations (on 'eatzy_db')..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db

Write-Host "[5/5] Seeding Data (on 'eatzy_db')..."
Get-Content db/seed.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db

Write-Host ""
Write-Host "🎉 LOCAL ENVIRONMENT READY!"
Write-Host "==============================================="