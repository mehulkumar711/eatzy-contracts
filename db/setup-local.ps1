$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Docker containers..."
docker-compose up -d

Write-Host "⏳ Waiting for PostgreSQL to accept connections..."
$retries = 0
do {
    Start-Sleep 2
    # Fix: Run command directly, send output to null, check LASTEXITCODE
    docker exec eatzy_postgres pg_isready -U user -q | Out-Null
    $retries++
} until ($LASTEXITCODE -eq 0 -or $retries -gt 30)

if ($retries -gt 30) { 
    throw "PostgreSQL never became ready." 
}

Write-Host "🔍 Testing database connection..."
docker exec eatzy_postgres psql -U user -d eatzy_db -c "SELECT 1;" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Database connection test failed" }

Write-Host "✅ DB Ready. Running Migrations..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "🌱 Seeding Data..."
Get-Content db/seed.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "🎉 Local Environment Ready!"