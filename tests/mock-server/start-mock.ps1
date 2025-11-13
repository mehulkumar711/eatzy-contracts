Write-Host "🚀 Starting Mock API..."
$serverProcess = Start-Process node "server.js" -PassThru -WorkingDirectory "tests/mock-server"

Write-Host "⏳ Waiting for API..."
$retries = 0
do {
    Start-Sleep 1
    try { $r = Invoke-WebRequest "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 1 } catch {}
    $retries++
} until (($r.StatusCode -eq 200) -or ($retries -gt 15))

if ($retries -gt 15) {
    Stop-Process -Id $serverProcess.Id -Force
    throw "Mock API failed to start."
}

Write-Host "✅ Mock API ready on port 8080"