# Path: db/setup-local.ps1
$ErrorActionPreference = "Stop"

$DB_NAME = "eatzy_db"
$DB_USER = "user"
$CONTAINER_NAME = "eatzy_postgres"
$TIMEOUT_SECONDS = 60

Write-Host "========== EATZY LOCAL DATABASE SETUP (v2.4) - NAMED VOLUMES =========="

# 1. Force Clean Containers & Volumes
Write-Host "[1/5] Performing hard reset..."
# CRITICAL: The '-v' flag removes the named volumes (wiping the DB data for a fresh start)
docker-compose down -v --remove-orphans | Out-Null
Write-Host "      Hard reset complete."

# 2. Start Services
Write-Host "[2/5] Starting Docker containers..."
docker-compose up -d

# 3. Robust Wait Logic
Write-Host "[3/5] Waiting for $CONTAINER_NAME healthcheck to pass (Max $TIMEOUT_SECONDS s)..."
$startTime = Get-Date

function Invoke-ContainerHealthCheck {
    param([string]$Container)
    # Check if container is running at all
    $state = docker inspect $Container --format '{{.State.Status}}' 2>$null
    if ($state -ne "running") { return "not-running" }
    return docker inspect $Container --format '{{.State.Health.Status}}'
}

do {
    Start-Sleep -Seconds 3
    $health = Invoke-ContainerHealthCheck $CONTAINER_NAME
    
    if ($health -eq "healthy") { 
        Write-Host "      ✅ $CONTAINER_NAME container is healthy."
        break 
    }
    if ($health -eq "not-running") {
        throw "Container crashed unexpectedly. Check Docker logs."
    }
    
    if ((Get-Date) -gt ($startTime).AddSeconds($TIMEOUT_SECONDS)) {
        throw "PostgreSQL container failed to become healthy within $TIMEOUT_SECONDS seconds."
    }
} while ($true)

# Helper Function
function Invoke-SqlFile {
    param([string]$Path)
    Write-Host "      -> Applying $(Split-Path -Leaf $Path)..."
    # We add a small retry here in case the DB is ready but the socket is warming up
    $retries = 0
    do {
        try {
            Get-Content $Path | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME 2>&1 | Out-Null
            return # Success
        } catch {
            $retries++
            if ($retries -ge 3) { throw $_ }
            Start-Sleep -Seconds 2
        }
    } while ($retries -lt 3)
}

# 4. Running Migrations
Write-Host "[4/5] Running Migrations (on '$DB_NAME')..."
Invoke-SqlFile "db/migrations/V1__init_sagas_and_idempotency.sql"
Invoke-SqlFile "db/migrations/V2__create_core_schema.sql"
Invoke-SqlFile "db/migrations/V4__add_admin_columns.sql"

# 5. Seeding Data
Write-Host "[5/5] Seeding Data (on '$DB_NAME')..."
Invoke-SqlFile "db/seed.sql"

Write-Host "`n🎉 LOCAL ENVIRONMENT READY!"
Write-Host "==============================================="