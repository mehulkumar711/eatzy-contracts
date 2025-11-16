$ErrorActionPreference = "Stop"
Write-Host "========== EATZY LOCAL DATABASE SETUP (v1.26) =========="

# Suppress warnings properly using 2>$null instead of 2>&1 | Out-Null
Write-Host "[1/5] Destroying old containers and stale volumes..."
docker compose down --volumes 2>$null

if (Test-Path -Path "./data") {
    Write-Host "      Nuking stale './data' folder..."
    Remove-Item -Recurse -Force ./data -ErrorAction SilentlyContinue
}

Write-Host "[2/5] Starting Docker containers..."
docker compose up -d --wait 2>$null
if ($LASTEXITCODE -ne 0) {
    throw "Docker compose failed. Postgres container never became healthy."
}

Write-Host "[3/5] ✅ PostgreSQL container is healthy."
Write-Host "      Verifying application database..."

$retries = 0
do {
    Start-Sleep 2; Write-Host "." -NoNewline
    docker exec -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db -c "SELECT 1;" 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { break }
    $retries++
} until ($retries -gt 20)

if ($retries -gt 20) { throw "Application database 'eatzy_db' never became ready." }

Write-Host "`n[4/5] Running Migrations..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db

Write-Host "[5/5] Seeding Data..."
Get-Content db/seed.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db

Write-Host "`n🎉 LOCAL ENVIRONMENT READY!"