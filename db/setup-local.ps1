$ErrorActionPreference = "Stop"

Write-Host "0. Destroying old database (Hard Reset)..."
docker-compose down --volumes
if (Test-Path -Path "./data") {
    Write-Host "Nuking stale './data' folder..."
    Remove-Item -Recurse -Force ./data
}

Write-Host "1. Starting Docker containers..."
docker compose up -d

Write-Host "2. Waiting for PostgreSQL to be ready..."
$retries = 0
$dbReady = $false
do {
    Start-Sleep 2
    Write-Host "." -NoNewline
    
    try {
        # We try to run the command. We don't care about output, only success.
        docker exec eatzy_postgres psql -U user -d eatzy_db -c "SELECT 1;" | Out-Null
        
        # If the command above fails, it throws an error.
        # If it succeeds, $LASTEXITCODE will be 0.
        if ($LASTEXITCODE -eq 0) {
            $dbReady = $true
            break # Success
        }
    } catch {
        # psql failed (e..g, db not ready), we catch the error and let the loop continue
    }
    
    $retries++
} until ($retries -gt 30)

Write-Host ""
if ($dbReady -eq $false) { throw "PostgreSQL database 'eatzy_db' never became ready (Timed out)." }

Write-Host "3. Database 'eatzy_db' is ready."
Write-Host "4. Running Migrations..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "5. Seeding Data..."
Get-Content db/seed.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "✅ Local Environment Ready!"