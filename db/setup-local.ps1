$ErrorActionPreference = "Stop"
Write-Host "========== EATZY LOCAL DATABASE SETUP (v1.12) =========="
Write-Host ""
Write-Host "[1/5] Destroying old containers and stale volumes..."
docker-compose down --volumes
if (Test-Path -Path "./data") {
    Write-Host "      Nuking stale './data' folder..."
    Remove-Item -Recurse -Force ./data
}

Write-Host "[2/5] Starting Docker containers..."
docker compose up -d

Write-Host "[3/5] Waiting for PostgreSQL to be ready..."
$retries = 0
$dbReady = $false
do {
    Start-Sleep 2
    Write-Host "." -NoNewline
    
    $status = docker inspect eatzy_postgres --format '{{.State.Status}}'
    if ($status -eq 'running') {
        #
        # THE FIX: Check against the default 'postgres' db,
        # which is guaranteed to exist when the service is up.
        #
        docker exec eatzy_postgres psql -h 127.0.0.1 -U user -d postgres -c "SELECT 1;" 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $dbReady = $true
            break # Success
        }
    }
    $retries++
} until ($retries -gt 30)

Write-Host ""
if ($dbReady -eq $false) { throw "PostgreSQL database 'postgres' never became ready (Timed out)." }
Write-Host "      ✅ Database 'postgres' is ready."
Write-Host "      Giving the database 2s to settle..."
Start-Sleep 2

Write-Host "[4/5] Running Migrations (on 'eatzy_db')..."
# Now we can safely run migrations on the 'eatzy_db'
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db

Write-Host "[5/5] Seeding Data (on 'eatzy_db')..."
Get-Content db/seed.sql | docker exec -i eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db

Write-Host ""
Write-Host "🎉 LOCAL ENVIRONMENT READY!"
Write-Host "==============================================="
