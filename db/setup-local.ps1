$ErrorActionPreference = "Stop"
Write-Host "========== EATZY LOCAL DATABASE SETUP (v1.22) =========="
Write-Host ""
Write-Host "[1/5] Destroying old containers and stale volumes..."
docker-compose down --volumes
if (Test-Path -Path "./data") {
    Write-Host "      Nuking stale './data' folder..."
    Remove-Item -Recurse -Force ./data -ErrorAction SilentlyContinue
}

Write-Host "[2/5] Starting Docker containers..."
#
# THE FIX (v1.22): Check $LASTEXITCODE.
# The '--wait' command will return a non-zero exit code if
# the healthcheck fails. We MUST catch this.
#
docker compose up -d --wait
if ($LASTEXITCODE -ne 0) {
    throw "Docker compose failed to start. Container healthcheck failed."
}

Write-Host "[3/5] ✅ PostgreSQL container is healthy and ready."
Write-Host "      Giving the database 2s to settle..."
Start-Sleep 2

#
# These commands will now work because the v1.22 compose file
# ensures the service is listening on TCP/IP.
#
Write-Host "[4/5] Running Migrations (on 'eatzy_db')..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db

Write-Host "[5/5] Seeding Data (on 'eatzy_db')..."
Get-Content db/seed.sql | docker exec -i -e PGPASSWORD=password eatzy_postgres psql -h 127.0.0.1 -U user -d eatzy_db

Write-Host ""
Write-Host "🎉 LOCAL ENVIRONMENT READY!"
Write-Host "==============================================="