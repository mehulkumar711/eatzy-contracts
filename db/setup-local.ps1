$ErrorActionPreference = "Stop"

Write-Host "0. Destroying old database (Hard Reset)..."
docker-compose down --volumes
if (Test-Path -Path "./data") {
    Write-Host "Nuking stale './data' folder..."
    Remove-Item -Recurse -Force ./data
}

Write-Host "1. Starting Docker containers..."
docker compose up -d

Write-Host "2. Waiting for PostgreSQL to be ready..."
$retries = 0
$dbReady = $false

do {
    Start-Sleep 2
    Write-Host "." -NoNewline

    $status = ""
    try {
        $status = docker inspect eatzy_postgres --format '{{.State.Status}}'
    } catch {
         # Container might not exist yet, just continue loop
    }

    if ($status -eq 'running') {
        # This 'try...catch' is the NEW fix.
        # It will catch the error and let the loop continue.
        try {
            # Run the command and silence all output streams
            docker exec eatzy_postgres psql -U user -d postgres -c "SELECT 1;" 2>&1 | Out-Null

            # If the command above succeeds, $LASTEXITCODE will be 0
            if ($LASTEXITCODE -eq 0) {
                $dbReady = $true
                break # Success
            }
        } catch {
            # Catch the "psql: error..." and do nothing.
            # This allows the loop to continue retrying.
        }
    }
    $retries++
} until ($retries -gt 30) # Wait for up to 60 seconds

Write-Host "" # Newline
if ($dbReady -eq $false) { throw "PostgreSQL database 'postgres' never became ready (Timed out)." }

Write-Host "3. Database 'postgres' is ready."
Write-Host "4. Running Migrations..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "5. Seeding Data..."
Get-Content db/seed.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "✅ Local Environment Ready!"