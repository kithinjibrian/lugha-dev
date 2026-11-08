#!/bin/sh
# Prints every code's `lughac explain` text, each after a line "%%% CODE".
# Runs where lughac is: inside the sandbox image (scripts/explanations.sh, and
# the Dockerfile's first stage).
set -eu
lughac explain | while read -r code _; do
  printf '%%%%%% %s\n' "$code"
  lughac explain "$code"
done
