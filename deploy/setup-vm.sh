#!/usr/bin/env bash
set -euo pipefail

echo "=== [1/4] Configurando 4 GB de SWAP (/swapfile) para evitar OOM em 1 GB RAM ==="
if [ ! -f /swapfile ]; then
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  if ! grep -q "/swapfile" /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  fi
fi
free -h

echo "=== [2/4] Criando diretórios persistentes em /var/lib/nutritrack ==="
sudo mkdir -p /var/lib/nutritrack/data /var/lib/nutritrack/uploads
sudo chmod -R 777 /var/lib/nutritrack

echo "=== [3/4] Instalando Node.js 20, Caddy Server e PM2 (Ultra Low-Footprint) ==="
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs sqlite3
fi

if ! command -v caddy >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg --yes
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
  sudo apt-get update
  sudo apt-get install -y caddy
fi

echo "=== [4/4] Ambiente Base Pronto! ==="
node -v
caddy version
