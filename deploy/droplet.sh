#!/bin/sh
# Prepares a fresh Ubuntu 24.04 droplet for the Lugha site (API-8, API-10):
# Docker, gVisor's runsc registered as Docker's "runsc" runtime, and swap.
# Nothing is built here: deploy/ship.sh builds the images on a developer's
# machine and copies them over. Safe to run again. Run as root; ship.sh runs
# it for you.
#
# The droplet needs no open ports: cloudflared connects out. Allow only SSH
# in, in DigitalOcean's firewall.

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

mkdir -p /opt/lugha/deploy
echo "droplet ready: $(docker --version), $(runsc --version | head -1)"
