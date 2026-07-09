$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$gemmaRoot = $env:GEMMA_ROOT
if (-not $gemmaRoot) {
    $gemmaRoot = "E:\abbchb\gemma"
}

function Test-Health([string]$Url) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

if (-not (Test-Health "http://127.0.0.1:8000/health")) {
    Write-Host "Starting Gemma on port 8000..."
    Start-Process powershell.exe `
        -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "$gemmaRoot\run_gemma.ps1" `
        -WindowStyle Hidden

    for ($attempt = 0; $attempt -lt 90; $attempt++) {
        Start-Sleep -Seconds 2
        if (Test-Health "http://127.0.0.1:8000/health") {
            break
        }
    }
}

if (-not (Test-Health "http://127.0.0.1:8000/health")) {
    throw "Gemma did not become ready on port 8000."
}

Write-Host "Gemma is ready. Starting Fast RAG on port 8003..."
Set-Location $projectRoot
& "$projectRoot\venv\Scripts\python.exe" -m uvicorn qwen_server:app --host 127.0.0.1 --port 8003
