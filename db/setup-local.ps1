$ErrorActionPreference = "Stop"
Write-Host "========== EATZY LOCAL DATABASE SETUP (v1.17) =========="
Write-Host ""
Write-Host "[1/5] Destroying old containers and stale volumes..."
docker-compose down --volumes
if (Test-Path -Path "./data") {
    Write-Host "      Nuking stale './data' folder..."
    Remove-Item -Recurse -Force ./data
}

Write-Host "[2/5] Starting Docker containers..."
#
# THE FIX (v1.17): Use '--wait'
# This command tells Docker Compose to wait until the 'healthcheck'
# in your docker-compose.yml file passes.
#
docker compose up -d --wait

Write-Host "[3/5] ✅ PostgreSQL container is healthy and ready."
Write-Host "      Giving the database 2s to settle..."
Start-Sleep 2

#
# We still use TCP/IP (-h) and Password (-e) for migrations
# to ensure we are simulating the NestJS app's connection.
#
Write-Host "[4/5] Running Migrations (on 'eatzy_db')..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db

Write-Host "[5/5] Seeding Data (on 'eatzy_db')..."
Get-Content db/seed.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db

Write-Host ""
Write-Host "🎉 LOCAL ENVIRONMENT READY!"
Write-Host "==============================================="