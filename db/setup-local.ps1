$ErrorActionPreference = "Stop"

Write-Host "========== EATZY LOCAL DATABASE SETUP (v1.8) =========="

# 1. Hard Reset: Stop containers, remove volumes, nuke ./data
Write-Host "`n[1/5] Destroying old database (Hard Reset)..."
docker-compose down --volumes
if (Test-Path -Path "./data") {
    Write-Host "     Nuking stale './data' folder..."
    Remove-Item -Recurse -Force ./data
}

# 2. Start fresh containers
Write-Host "`n[2/5] Starting Docker containers..."
docker compose up -d

# 3. Wait for PostgreSQL to be "healthy"
Write-Host "`n[3/5] Waiting for PostgreSQL to be healthy..."
$retries = 0
$health = "starting"
do {
    Start-Sleep 2
    Write-Host "." -NoNewline
    
    # This command reads the "healthcheck" status from docker-compose.yml
    $health = docker inspect eatzy_postgres --format '{{.State.Health.Status}}'
    $retries++
} until ($health -eq 'healthy' -or $retries -gt 30)

Write-Host "" # New line
if ($health -ne 'healthy') { 
    Write-Host "❌ FATAL: PostgreSQL container failed to become healthy."
    Write-Host "Run 'docker logs eatzy_postgres' to see the error."
    throw "PostgreSQL health check failed." 
}

Write-Host "     ✅ Database 'eatzy_db' is ready."

# 4. Run Migrations (PowerShell-safe)
Write-Host "`n[4/5] Running Migrations..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

# 5. Seed Data (PowerShell-safe)
Write-Host "`n[5/5] Seeding Data..."
Get-Content db/seed.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "`n🎉 LOCAL ENVIRONMENT READY!"
Write-Host "==============================================="