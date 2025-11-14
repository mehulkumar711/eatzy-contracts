$ErrorActionPreference = "Stop"

Write-Host "0. Destroying old database (Hard Reset)..."
# Stop and remove containers, networks, AND anonymous volumes
docker-compose down --volumes

# FIX: Manually delete the bind-mount data folder to ensure a clean state
if (Test-Path -Path "./data") {
    Write-Host "Nuking stale './data' folder..."
    Remove-Item -Recurse -Force ./data
}

Write-Host "1. Starting Docker containers..."
# Use 'docker compose' (modern syntax)
docker compose up -d

Write-Host "2. Waiting for PostgreSQL to be ready..."
$retries = 0
$dbReady = $false
do {
    Start-Sleep 2
    Write-Host "." -NoNewline
    
    $status = docker inspect eatzy_postgres --format '{{.State.Status}}'
    if ($status -eq 'running') {
        # FIX: Check against the default 'postgres' db, which always exists
        # This confirms the service is up before we try to use 'eatzy_db'
        docker exec eatzy_postgres psql -U user -d postgres -c "SELECT 1;" 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $dbReady = $true
            break # Success
        }
    }
    $retries++
} until ($retries -gt 30)

Write-Host "" # New line after the dots
if ($dbReady -eq $false) { throw "PostgreSQL database 'postgres' never became ready (Timed out)." }

Write-Host "3. Database 'postgres' is ready."
Write-Host "4. Running Migrations (against 'eatzy_db')..."
# These commands will now succeed because 'eatzy_db' was created by docker-compose
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "5. Seeding Data..."
Get-Content db/seed.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "✅ Local Environment Ready!"