$ErrorActionPreference = "Stop"

Write-Host "1. Starting Docker containers..."
# Try standard docker-compose, if fails try new 'docker compose'
try {
    docker-compose up -d
} catch {
    Write-Host "docker-compose not found, trying 'docker compose'..."
    docker compose up -d
}

Write-Host "2. Waiting for PostgreSQL to be ready..."
$retries = 0
do {
    Start-Sleep 2
    # FIX: We pipe to Out-Null so we don't create an unused variable.
    # We rely on $LASTEXITCODE to check success.
    docker exec eatzy_postgres pg_isready -U user -q | Out-Null
    $retries++
    Write-Host "." -NoNewline
} until ($LASTEXITCODE -eq 0 -or $retries -gt 30)

Write-Host "" # New line

if ($retries -gt 30) { 
    throw "PostgreSQL never became ready (Timed out)." 
}

Write-Host "3. Testing database connection..."
docker exec eatzy_postgres psql -U user -d eatzy_db -c "SELECT 1;" | Out-Null

Write-Host "4. Running Migrations..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "5. Seeding Data..."
Get-Content db/seed.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "✅ Local Environment Ready!"