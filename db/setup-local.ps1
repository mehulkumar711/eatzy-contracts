# Path: db/setup-local.ps1
$ErrorActionPreference = "Stop"

$DB_NAME = "eatzy_db"
$DB_USER = "user"
$CONTAINER_NAME = "eatzy_postgres"

Write-Host "========== EATZY LOCAL DATABASE SETUP (v2.2) - FIXING P0 =========="

# 1. Force Clean Containers (Ensures no stale data from prior runs)
Write-Host "[1/5] Performing hard reset: removing all local volumes..."
docker-compose down -v --remove-orphans | Out-Null
Write-Host "      Hard reset complete."

# 2. Start Services
Write-Host "[2/5] Starting Docker containers (waiting for healthcheck)..."
docker-compose up -d

# 3. Robust Wait Logic
Write-Host "[3/5] Waiting for $CONTAINER_NAME healthcheck to pass..."
$TimeoutSeconds = 45
$startTime = Get-Date

do {
    Start-Sleep -Seconds 3
    $health = docker inspect $CONTAINER_NAME --format '{{.State.Health.Status}}' 
    if ($health -eq "healthy") { 
        Write-Host "      ✅ $CONTAINER_NAME container is healthy."
        break 
    }
    if ((Get-Date) -gt ($startTime).AddSeconds($TimeoutSeconds)) {
        throw "PostgreSQL container failed to become healthy within $TimeoutSeconds seconds."
    }
} while ($true)

# 4. Running Migrations
Write-Host "[4/5] Running Migrations (on '$DB_NAME')..."

# Function to execute SQL files inside the running container
function Execute-SqlFile {
    param(
        [string]$Path
    )
    Write-Host "      -> Applying $(Split-Path -Leaf $Path)..."
    Get-Content $Path | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME
}

# Apply all migrations in order (V1, V2, V4)
Execute-SqlFile "db/migrations/V1__init_sagas_and_idempotency.sql"
Execute-SqlFile "db/migrations/V2__create_core_schema.sql"
Execute-SqlFile "db/migrations/V4__add_admin_columns.sql" # CRITICAL: Includes the phone DROP NOT NULL fix

# 5. Seeding Data
Write-Host "[5/5] Seeding Data (on '$DB_NAME')..."
Execute-SqlFile "db/seed.sql"

Write-Host "`n🎉 LOCAL ENVIRONMENT READY!"
Write-Host "==============================================="