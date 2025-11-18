# db/setup-local.ps1 (Partial Update)

# ... (Previous code remains the same until Migrations section)

Write-Host "[4/5] Running Migrations (on 'eatzy_db')..."
Get-Content db/migrations/V1__init_sagas_and_idempotency.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db
Get-Content db/migrations/V2__create_core_schema.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

# NEW: Run V4 migration to add the 'username' column
Get-Content db/migrations/V4__add_admin_columns.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db 

Write-Host "[5/5] Seeding Data (on 'eatzy_db')..."
Get-Content db/seed.sql | docker exec -i eatzy_postgres psql -U user -d eatzy_db

Write-Host "`n🎉 LOCAL ENVIRONMENT READY!"
# ... (rest of the file)