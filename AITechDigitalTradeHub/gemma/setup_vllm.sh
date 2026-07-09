#!/usr/bin/env bash
set -euo pipefail

if [[ "$EUID" -ne 0 ]]; then
  echo "This installer must be launched by Windows as the WSL root user."
  echo "Run: wsl -d GemmaUbuntu -u root -- bash /mnt/e/abbchb/gemma/setup_vllm.sh"
  exit 1
fi

TARGET_USER="${VLLM_USER:-aitech}"
TARGET_HOME="$(getent passwd "$TARGET_USER" | cut -d: -f6)"
VENV="$TARGET_HOME/.venvs/gemma-vllm"

if [[ -z "$TARGET_HOME" ]]; then
  echo "WSL user '$TARGET_USER' was not found."
  exit 1
fi

echo "[1/4] Installing Python prerequisites..."
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  python3.12-venv \
  python3-pip \
  build-essential

echo "[2/4] Creating a clean virtual environment..."
install -d -o "$TARGET_USER" -g "$TARGET_USER" "$TARGET_HOME/.venvs"
runuser -u "$TARGET_USER" -- python3 -m venv --clear "$VENV"

echo "[3/4] Updating pip..."
runuser -u "$TARGET_USER" -- "$VENV/bin/python" -m pip install \
  --timeout 120 \
  --retries 10 \
  --upgrade pip setuptools wheel

echo "[4/4] Installing vLLM 0.20.0..."
runuser -u "$TARGET_USER" -- "$VENV/bin/python" -m pip install \
  --timeout 120 \
  --retries 10 \
  --prefer-binary \
  "vllm==0.20.0"

runuser -u "$TARGET_USER" -- "$VENV/bin/vllm" --version
echo "vLLM is ready in $VENV"
