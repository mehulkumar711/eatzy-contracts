# Path: db/setup-local.ps1
$ErrorActionPreference = "Stop"

$DB_NAME = "eatzy_db"
$DB_USER = "user"
$CONTAINER_NAME = "eatzy_postgres"
$TIMEOUT_SECONDS = 45

Write-Host "========== EATZY LOCAL DATABASE SETUP (v2.3) - FIXING P0 & STYLE =========="

# 1. Force Clean Containers (Ensures no stale data from prior runs)
Write-Host "[1/5] Performing hard reset: removing all local volumes..."
# CRITICAL: Ensures the old container and persistent data are gone.
docker-compose down -v --remove-orphans | Out-Null
Remove-Item -Path '.\data' -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
Write-Host "      Hard reset complete."

# 2. Start Services
Write-Host "[2/5] Starting Docker containers..."
# CRITICAL: This restarts the containers for a fresh run.
docker-compose up -d

# 3. Robust Wait Logic (Checking health status)
Write-Host "[3/5] Waiting for $CONTAINER_NAME healthcheck to pass (Max $TIMEOUT_SECONDS s)..."
$startTime = Get-Date

function Invoke-ContainerHealthCheck {
    param([string]$Container)
    return docker inspect $Container --format '{{.State.Health.Status}}'
}

do {
    Start-Sleep -Seconds 3
    $health = Invoke-ContainerHealthCheck $CONTAINER_NAME
    if ($health -eq "healthy") { 
        Write-Host "      ✅ $CONTAINER_NAME container is healthy."
        break 
    }
    if ((Get-Date) -gt ($startTime).AddSeconds($TIMEOUT_SECONDS)) {
        throw "PostgreSQL container failed to become healthy within $TIMEOUT_SECONDS seconds."
    }
} while ($true)

# Function using approved verb 'Invoke-'
function Invoke-SqlFile {
    param([string]$Path)
    Write-Host "      -> Applying $(Split-Path -Leaf $Path)..."
    # CRITICAL: This now runs ONLY after the container is verified healthy.
    Get-Content $Path | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME
}

# 4. Running Migrations
Write-Host "[4/5] Running Migrations (on '$DB_NAME')..."
# Apply all migrations in order (V1, V2, V4)
Invoke-SqlFile "db/migrations/V1__init_sagas_and_idempotency.sql"
Invoke-SqlFile "db/migrations/V2__create_core_schema.sql"
Invoke-SqlFile "db/migrations/V4__add_admin_columns.sql" # CRITICAL: V4 migration (phone DROP NOT NULL)

# 5. Seeding Data
Write-Host "[5/5] Seeding Data (on '$DB_NAME')..."
Invoke-SqlFile "db/seed.sql"

Write-Host "`n🎉 LOCAL ENVIRONMENT READY!"
Write-Host "==============================================="