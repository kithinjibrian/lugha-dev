#!/bin/sh
# Writes generated/explanations.txt (PRP-002, WEB-8): `lughac --version` and
# every code's `lughac explain` text from the pinned sandbox image, for `npm run build`
# outside Docker. The Dockerfile's first stage makes the same file.
#
# SANDBOX_IMAGE names the image (default lugha-sandbox:m159).
set -eu
cd "$(dirname "$0")/.."
mkdir -p generated
docker run --rm -i --network=none --read-only --entrypoint /bin/sh \
  "${SANDBOX_IMAGE:-lugha-sandbox:m159}" -s < scripts/explain-all.sh > generated/explanations.txt.new
mv generated/explanations.txt.new generated/explanations.txt
echo "generated/explanations.txt: $(sed -n 2p generated/explanations.txt), $(grep -c '^%%% [EW]' generated/explanations.txt) codes"
