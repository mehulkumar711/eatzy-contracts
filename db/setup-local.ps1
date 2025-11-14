$ErrorActionPreference = "Stop"

Write-Host "0. Destroying old database (Hard Reset)..."
docker-compose down --volumes
if (Test-Path -Path "./data") {
    Write-Host "Nuking stale './data' folder..."
    Remove-Item -Recurse -Force ./data
}

Write-Host "1. Starting Docker containers..."
docker compose up -d

Write-Host "2. Waiting for PostgreSQL to be healthy..."
$retries = 0
do {
    Start-Sleep 2
    # Patched: Check the Docker health status, not just 'running'
    $health = docker inspect eatzy_postgres --format '{{.State.Health.Status}}'
    $retries++
    Write-Host "." -NoNewline
} until ($health -eq 'healthy' -or $retries -gt 30)

Write-Host ""
if ($health -ne 'healthy') { throw "PostgreSQL never became healthy (Timed out)." }

Write-Host "3. Database 'eatzy_db' is ready."
Write-Host "4. Running Migrations..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "5. Seeding Data..."
Get-Content db/seed.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "✅ Local Environment Ready!"