Write-Host "🧹 Cleaning up local environment..."
docker-compose down --volumes --remove-orphans
if (Test-Path data) { Remove-Item -Recurse -Force data }
Write-Host "✅ Environment cleaned"