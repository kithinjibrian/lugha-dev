#!/bin/sh
# Brings the droplet up to one commit of main. GitHub Actions runs it
# over SSH after pushing that commit's images, with a key that can run nothing
# else: in /root/.ssh/authorized_keys it is
#
#   command="/opt/lugha/deploy/update.sh",restrict ssh-ed25519 AAAA… lugha-ci
#
# so the workflow's command arrives in SSH_ORIGINAL_COMMAND as "deploy <sha>".
# By hand, on the droplet: deploy/update.sh deploy <sha>
#
# It moves /opt/lugha to that commit, pulls the images built from it (tagged
# with the sha) and restarts what changed, then checks the site answers.

set -eu

cmd=${SSH_ORIGINAL_COMMAND:-$*}
case $cmd in
	"deploy "*) sha=${cmd#deploy } ;;
	*) echo "usage: deploy <40-character commit sha>" >&2; exit 2 ;;
esac
case $sha in
	*[!0-9a-f]*) echo "not a commit sha" >&2; exit 2 ;;
esac
[ ${#sha} -eq 40 ] || { echo "not a commit sha" >&2; exit 2; }

cd /opt/lugha
git fetch -q origin main
git merge-base --is-ancestor "$sha" origin/main || { echo "$sha isn't on main" >&2; exit 1; }
git checkout -q -f main
git reset -q --hard "$sha"

compose() { IMAGE_TAG=$sha docker compose --env-file .env --env-file deploy/prod.env "$@"; }

# The sandbox service is never started (scale 0), so pull its image by name.
compose pull --quiet
docker pull --quiet "$(compose config --images | grep lugha-sandbox)"
compose up -d --no-build --remove-orphans
docker image prune -f >/dev/null

sleep 3
curl -fsS -o /dev/null http://127.0.0.1:8080/ || { echo "the site didn't answer" >&2; exit 1; }
curl -fsS http://127.0.0.1:8080/api/version || { echo "the API didn't answer" >&2; exit 1; }
echo
echo "deployed $sha"
