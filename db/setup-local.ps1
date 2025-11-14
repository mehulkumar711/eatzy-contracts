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
do {
    Start-Sleep 2
    $status = docker inspect eatzy_postgres --format '{{.State.Status}}'
    if ($status -eq 'running') {
        docker exec eatzy_postgres pg_isready -U user -q | Out-Null
        if ($LASTEXITCODE -eq 0) {
            break # Success
        }
    }
    $retries++
    Write-Host "." -NoNewline
} until ($retries -gt 30)

Write-Host ""
if ($retries -gt 30) { throw "PostgreSQL never became ready (Timed out)." }

Write-Host "3. Testing database connection..."
docker exec eatzy_postgres psql -U user -d eatzy_db -c "SELECT 1;" | Out-Null

Write-Host "4. Running Migrations..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "5. Seeding Data..."
Get-Content db/seed.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "✅ Local Environment Ready!"