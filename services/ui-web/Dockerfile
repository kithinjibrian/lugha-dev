# The site, built from the repository root by compose:
#   docker compose --profile sandbox build
# 1. explanations: lughac's version and every code's explanation, from the
#    sandbox image itself (compose passes it in as the `sandbox` context).
# 2. site: npm ci and astro build, which reads content/ and checks it.
# 3. caddy: the built site and the Caddyfile.

FROM sandbox AS explanations
COPY services/ui-web/scripts/explain-all.sh /tmp/explain-all.sh
RUN sh /tmp/explain-all.sh > /tmp/explanations.txt

FROM node:22.22.1-bookworm-slim AS site
WORKDIR /repo/services/ui-web
COPY services/ui-web/package.json services/ui-web/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY content /repo/content
COPY services/ui-web ./
COPY --from=explanations /tmp/explanations.txt generated/explanations.txt
RUN npm run build

FROM caddy:2.8.4
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=site /repo/services/ui-web/dist /srv
