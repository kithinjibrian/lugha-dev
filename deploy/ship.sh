#!/bin/sh
# Deploys the Lugha site to its droplet (API-8, API-10), from a developer's
# machine with the repository:
#
#   deploy/ship.sh root@<droplet>
#
# Builds the three images here (lughac is never compiled on the droplet),
# prepares the droplet (deploy/droplet.sh), copies the images and the compose
# file over, and starts everything with the tunnel. Run it again to deploy a
# new version. SSH_OPTS passes options to ssh, such as "-i ~/.ssh/key".
#
# The droplet's /opt/lugha/.env holds DOCKER_GID and CLOUDFLARE_TUNNEL_TOKEN.
# It is written once, by the owner, on the droplet (the command is printed
# below when it's missing); this script never reads it.

set -eu

HOST=${1:?usage: deploy/ship.sh root@<droplet>}
DIR=/opt/lugha
REF=${LUGHAC_REF:-m154}
IMAGES="lugha-sandbox:$REF lugha-api:latest lugha-web:$REF"
# shellcheck disable=SC2086
remote() { ssh ${SSH_OPTS:-} "$HOST" "$@"; }

cd "$(dirname "$0")/.."

echo "== building the images here"
DOCKER_GID=0 docker compose build

echo "== preparing the droplet"
remote sh -s < deploy/droplet.sh

echo "== copying the compose file and the clean-up job"
tar -cf - docker-compose.yml deploy/cleanup | remote "tar -xf - -C $DIR"

echo "== copying the images (about 1 GB before compression)"
# shellcheck disable=SC2086
docker save $IMAGES | gzip -1 | remote "gunzip | docker load"

if ! remote "test -s $DIR/.env"; then
	echo
	echo "The droplet has no $DIR/.env yet. Write it yourself (the token stays off this machine's logs):"
	echo
	echo "  ssh -t $HOST 'umask 077; read -rsp \"Cloudflare Tunnel token: \" t; echo; printf \"DOCKER_GID=%s\\nCLOUDFLARE_TUNNEL_TOKEN=%s\\n\" \"\$(stat -c %g /var/run/docker.sock)\" \"\$t\" > $DIR/.env'"
	echo
	echo "then run deploy/ship.sh $HOST again."
	exit 1
fi

echo "== starting"
remote "cd $DIR && docker compose --profile tunnel up -d --no-build --remove-orphans && docker image prune -f >/dev/null"

echo "== checking"
sleep 3
remote "curl -fsS -o /dev/null http://127.0.0.1:8080/ && echo 'site: ok' && curl -fsS http://127.0.0.1:8080/api/version && echo"
python3 -c 'import json,sys; print(json.dumps({"files":[{"path":"src/main.la","text":open(sys.argv[1]).read()}],"entry":"src/main.la","args":[],"stdin":"","opt":0}))' content/home/src/main.la \
	| remote "curl -fsS -H 'content-type: application/json' --data-binary @- http://127.0.0.1:8080/api/run" && echo
echo "Home's fib.la should print: $(cat content/home/expected.txt)"
remote "cd $DIR && docker compose --profile tunnel ps --format '{{.Service}}: {{.Status}}'"
