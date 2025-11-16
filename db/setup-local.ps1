$ErrorActionPreference = "Stop"
Write-Host "========== EATZY LOCAL DATABASE SETUP (v1.27) =========="
Write-Host ""
Write-Host "[1/5] Destroying old containers and stale volumes..."
# Silence errors from 'down' command as well
Invoke-Command {
    $ErrorActionPreference = "Continue"
    docker compose down --volumes 2>$null
}
if (Test-Path -Path "./data") {
    Write-Host "      Nuking stale './data' folder..."
    Remove-Item -Recurse -Force ./data -ErrorAction SilentlyContinue
}

Write-Host "[2/5] Starting Docker containers (waiting for healthcheck)..."
#
# THE FIX (v1.27): Temporarily set ErrorAction to 'Continue'
# to prevent PowerShell from treating Docker's 'stderr' progress
# output as a script-terminating error.
#
Invoke-Command {
    $ErrorActionPreference = "Continue"
    docker compose up -d --wait 2>$null
}

# We still check the $LASTEXITCODE to catch *real* failures.
if ($LASTEXITCODE -ne 0) {
    throw "Docker compose failed. Container healthcheck failed. Run 'docker logs eatzy_postgres' for details."
}

Write-Host "[3/5] ✅ PostgreSQL container is healthy."
Write-Host "      Now verifying application database is ready..."

# Explicitly wait for your database to be created over TCP/IP
$retries = 0
$dbReady = $false
do {
    Start-Sleep 2
    Write-Host "." -NoNewline
    
    # We must use TCP/IP and password to simulate the app
    docker exec -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db -c "SELECT 1;" 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $dbReady = $true
        break
    }
    $retries++
} until ($retries -gt 20)

Write-Host ""
if (-not $dbReady) { 
    throw "Application database 'eatzy_db' never became ready (Timed out)." 
}
Write-Host "      ✅ Application database is ready."
Write-Host "      Giving 2s to settle..."
Start-Sleep 2

Write-Host "[4/5] Running Migrations (on 'eatzy_db')..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db

Write-Host "[5/5] Seeding Data (on 'eatzy_db')..."
Get-Content db/seed.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db

Write-Host ""
Write-Host "🎉 LOCAL ENVIRONMENT READY!"
Write-Host "==============================================="