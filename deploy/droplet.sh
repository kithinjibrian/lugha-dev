#!/bin/sh
# Sets up the Lugha site on a fresh Ubuntu 24.04 droplet (API-8, API-10), or
# updates it to the latest main when run again. Run it on the droplet as root:
#
#   curl -fsSL https://raw.githubusercontent.com/kithinjibrian/lugha-dev/main/deploy/droplet.sh -o droplet.sh
#   sh droplet.sh
#
# The first run asks for the Cloudflare Tunnel's token (Zero Trust → Networks →
# Tunnels → the tunnel → its docker command, the part after --token) and keeps
# it in /opt/lugha/.env, readable by root only. In Cloudflare, the tunnel's
# public hostnames (lugha-lang.org, and www if wanted) point at http://caddy:80.
#
# The droplet needs no open ports: cloudflared connects out. Close everything
# but SSH in DigitalOcean's firewall.

set -eu

REPO=${REPO:-https://github.com/kithinjibrian/lugha-dev.git}
DIR=/opt/lugha

[ "$(id -u)" = 0 ] || { echo "run as root" >&2; exit 1; }

# ---- Docker, from Docker's own apt repository ---------------------------
if ! command -v docker >/dev/null; then
	apt-get update
	apt-get install -y ca-certificates curl git
	install -m 0755 -d /etc/apt/keyrings
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
	echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
		> /etc/apt/sources.list.d/docker.list
	apt-get update
	apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# ---- gVisor's runsc, registered with Docker as "runsc" (API-6) ----------
if ! command -v runsc >/dev/null; then
	curl -fsSL https://gvisor.dev/archive.key | gpg --dearmor -o /usr/share/keyrings/gvisor-archive-keyring.gpg
	echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/gvisor-archive-keyring.gpg] https://storage.googleapis.com/gvisor/releases release main" \
		> /etc/apt/sources.list.d/gvisor.list
	apt-get update
	apt-get install -y runsc
	runsc install
	systemctl restart docker
fi
docker info --format '{{json .Runtimes}}' | grep -q runsc || { echo "runsc isn't registered with Docker" >&2; exit 1; }

# lughac's build (Rust and LLVM) needs more memory than a small droplet has.
if [ ! -e /swapfile ]; then
	fallocate -l 4G /swapfile
	chmod 600 /swapfile
	mkswap /swapfile
	swapon /swapfile
	echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

# ---- the code -----------------------------------------------------------
if [ -d "$DIR/.git" ]; then
	git -C "$DIR" pull --ff-only
else
	git clone "$REPO" "$DIR"
fi
cd "$DIR"

if [ ! -e .env ]; then
	printf "Cloudflare Tunnel token: "
	stty -echo
	read -r token
	stty echo
	echo
	umask 077
	printf "DOCKER_GID=%s\nCLOUDFLARE_TUNNEL_TOKEN=%s\n" "$(stat -c %g /var/run/docker.sock)" "$token" > .env
fi

# ---- build and start ----------------------------------------------------
docker compose build
docker compose --profile tunnel up -d --remove-orphans

# ---- check it answers ---------------------------------------------------
sleep 3
curl -fsS -o /dev/null http://127.0.0.1:8080/ && echo "site: ok"
curl -fsS http://127.0.0.1:8080/api/version && echo
# Home's fib.la through the sandbox: its output should match expected.txt.
python3 -c 'import json,sys; print(json.dumps({"files":[{"path":"src/main.la","text":open(sys.argv[1]).read()}],"entry":"src/main.la","args":[],"stdin":"","opt":0}))' content/home/src/main.la \
	| curl -fsS -H 'content-type: application/json' --data-binary @- http://127.0.0.1:8080/api/run && echo
echo "expected stdout:" && cat content/home/expected.txt
docker compose --profile tunnel ps
