#!/bin/sh
# Prepares a fresh Ubuntu 24.04 droplet for the Lugha site (API-8, API-10):
# Docker, gVisor's runsc registered as Docker's "runsc" runtime, swap, and ufw
# letting in only SSH. Safe to run again. Run as root, after
# `apt-get update && apt-get upgrade` and a reboot if one is asked for.
#
# Nothing is built here: GitHub Actions builds the images and runs
# deploy/update.sh (see .github/workflows/deploy.yml). The droplet needs no
# open ports but SSH: cloudflared connects out.

set -eu

[ "$(id -u)" = 0 ] || { echo "run as root" >&2; exit 1; }
export DEBIAN_FRONTEND=noninteractive

# ---- Docker, from Docker's own apt repository ---------------------------
if ! command -v docker >/dev/null; then
	apt-get update -q
	apt-get install -yq ca-certificates curl gnupg
	install -m 0755 -d /etc/apt/keyrings
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
	echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
		> /etc/apt/sources.list.d/docker.list
	apt-get update -q
	apt-get install -yq docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# ---- gVisor's runsc (API-6) ---------------------------------------------
if ! command -v runsc >/dev/null; then
	curl -fsSL https://gvisor.dev/archive.key | gpg --batch --yes --dearmor -o /usr/share/keyrings/gvisor-archive-keyring.gpg
	echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/gvisor-archive-keyring.gpg] https://storage.googleapis.com/gvisor/releases release main" \
		> /etc/apt/sources.list.d/gvisor.list
	apt-get update -q
	apt-get install -yq runsc
fi
if ! docker info --format '{{json .Runtimes}}' | grep -q runsc; then
	runsc install
	systemctl restart docker
fi
docker info --format '{{json .Runtimes}}' | grep -q runsc || { echo "runsc isn't registered with Docker" >&2; exit 1; }

# ---- swap: room for a sandbox's 1 GB next to everything else -------------
if [ ! -e /swapfile ]; then
	fallocate -l 2G /swapfile
	chmod 600 /swapfile
	mkswap /swapfile
	swapon /swapfile
	echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

# ---- the firewall: SSH only, rate-limited --------------------------------
# Docker's published ports bypass ufw; compose publishes only 127.0.0.1:8080.
apt-get install -yq ufw git
ufw default deny incoming
ufw default allow outgoing
ufw limit OpenSSH
ufw --force enable

echo "droplet ready: $(docker --version), $(runsc --version | head -1)"
