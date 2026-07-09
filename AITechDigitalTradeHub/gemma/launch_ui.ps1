$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot
$url = "http://127.0.0.1:7860"

Write-Host "Starting Gemma Studio at $url"
$server = Start-Process python `
    -ArgumentList "-m", "uvicorn", "gemma_ui:app", "--host", "127.0.0.1", "--port", "7860" `
    -NoNewWindow `
    -PassThru

for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
        Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1 | Out-Null
        break
    }
    catch {
        Start-Sleep -Milliseconds 300
    }
}

if ($server.HasExited) {
    throw "Gemma Studio could not start."
}

try {
    $ragHealth = Invoke-RestMethod -Uri "http://127.0.0.1:8003/health" -TimeoutSec 1
    if ($ragHealth.service_version -ne "gemma-rag-3") {
        throw "Old RAG service detected."
    }
}
catch {
    $oldListeners = Get-NetTCPConnection -LocalPort 8003 -State Listen -ErrorAction SilentlyContinue
    foreach ($listener in $oldListeners) {
        Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Milliseconds 500
    Invoke-RestMethod -Uri "$url/api/rag/start" -Method Post | Out-Null
}

Start-Process $url
Write-Host "Gemma Studio is running. Close this window or press Ctrl+C to stop the UI."
Wait-Process -Id $server.Id
