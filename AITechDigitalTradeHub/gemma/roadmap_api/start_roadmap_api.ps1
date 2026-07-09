$ErrorActionPreference = "Stop"

# Starts the AITech roadmap API on port 8181.
# Requires the Gemma vLLM server to be up on port 8000 (see ..\run_gemma.ps1).

$projectRoot = $PSScriptRoot

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
        -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "$projectRoot\..\run_gemma.ps1" `
        -WindowStyle Hidden

    for ($attempt = 0; $attempt -lt 120; $attempt++) {
        Start-Sleep -Seconds 2
        if (Test-Health "http://127.0.0.1:8000/health") {
            break
        }
    }
}

if (-not (Test-Health "http://127.0.0.1:8000/health")) {
    throw "Gemma did not become ready on port 8000."
}

if (-not (Test-Path "$projectRoot\venv\Scripts\python.exe")) {
    Write-Host "Creating virtual environment..."
    python -m venv "$projectRoot\venv"
    & "$projectRoot\venv\Scripts\python.exe" -m pip install --upgrade pip
    & "$projectRoot\venv\Scripts\python.exe" -m pip install -r "$projectRoot\requirements.txt"
}

# Shared secret; the .NET backend must send the same value in the X-Api-Key header.
if (-not $env:ROADMAP_API_KEY) {
    Write-Warning "ROADMAP_API_KEY is not set; the API will accept unauthenticated requests."
}

Write-Host "Gemma is ready. Starting Roadmap API on port 8181..."
Set-Location $projectRoot
& "$projectRoot\venv\Scripts\python.exe" -m uvicorn roadmap_server:app --host 0.0.0.0 --port 8181
