$ErrorActionPreference = "Stop"

$distro = "GemmaUbuntu"
$modelPath = "/mnt/e/abbchb/gemma"
$vllm = "~/.venvs/gemma-vllm/bin/vllm"

$check = wsl -d $distro -- bash -lc "test -x $vllm"
if ($LASTEXITCODE -ne 0) {
    Write-Host "vLLM is not installed. Running the one-time setup..."
    wsl -d $distro -u root -- bash /mnt/e/abbchb/gemma/setup_vllm.sh
    if ($LASTEXITCODE -ne 0) {
        throw "vLLM setup failed. Check the internet connection and run this script again."
    }
}

Write-Host "Starting Gemma 4 at http://127.0.0.1:8000"
Write-Host "Keep this window open. Press Ctrl+C to stop the server."

wsl -d $distro -- bash -lc @"
$vllm serve '$modelPath' \
  --served-model-name gemma4 \
  --tool-call-parser gemma4 \
  --reasoning-parser gemma4 \
  --enable-auto-tool-choice \
  --trust-remote-code \
  --max-model-len 8192 \
  --max-num-batched-tokens 4096 \
  --gpu-memory-utilization 0.92 \
  --host 0.0.0.0 \
  --port 8000
"@
