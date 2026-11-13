# The API's two images (PRP-001, API-6 and API-10), built from services/api:
#
#   target sandbox: what every sandbox container runs. A pinned lughac, the C
#     compiler lughac links with, the runner, and a warm, read-only cache.
#   target api: the API server, with the Docker command line it starts
#     sandboxes with.
#
# Both share the lughac stage, so lughac is built once. docker compose builds
# them (docker compose --profile sandbox build); change LUGHAC_REF to move to
# another lughac, and the sandbox image's tag follows it.

ARG UBUNTU=ubuntu:26.04

# ---- lughac, from source at a pinned tag -------------------------------
FROM ${UBUNTU} AS lughac
ARG LUGHAC_REPO=https://github.com/kithinjibrian/lugha.git
ARG LUGHAC_REF=m159
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      ca-certificates curl git build-essential llvm-21-dev libssl-dev pkg-config \
 && rm -rf /var/lib/apt/lists/*
# rustup reads the toolchain the repository pins (rust-toolchain.toml).
ENV RUSTUP_HOME=/opt/rustup CARGO_HOME=/opt/cargo PATH=/opt/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain none
RUN git clone --depth 1 --branch "${LUGHAC_REF}" "${LUGHAC_REPO}" /src/lugha
WORKDIR /src/lugha
RUN cargo build --release --locked && cp target/release/lughac /usr/local/bin/lughac

# ---- the API's own programs, built with that lughac ---------------------
FROM lughac AS programs
WORKDIR /src/api
COPY lugha.toml ./
COPY src ./src
RUN lughac build -O 2 src/runner/main.la -o /usr/local/bin/runner \
 && lughac build -O 2 src/main.la -o /usr/local/bin/api

# ---- target sandbox ------------------------------------------------------
FROM ${UBUNTU} AS sandbox
# libllvm21 for lughac itself; gcc and libc6-dev because lughac compiles and
# links every program with cc; libssl-dev so programs importing std.tls or
# std.http still link (they find no network at run time).
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      libllvm21 gcc libc6-dev libssl-dev \
 && rm -rf /var/lib/apt/lists/*
COPY --from=lughac /usr/local/bin/lughac /usr/local/bin/lughac
COPY --from=programs /usr/local/bin/runner /usr/local/bin/runner
# lughac's object cache. Warmed now by building a program at both levels and
# running a test, then made read-only: lughac reads hits and skips writing
# when it can't ("A cache that can't be written is simply not used").
ENV LUGHA_CACHE=/opt/lugha-cache TMPDIR=/tmp
COPY sandbox/warm /opt/warm
RUN cd /opt/warm \
 && lughac build -O 0 src/main.la -o /tmp/w0 \
 && lughac build -O 2 src/main.la -o /tmp/w2 \
 && lughac test . \
 && rm -rf /tmp/w0 /tmp/w2 /opt/warm \
 && chmod -R a-w /opt/lugha-cache
# The container runs as user 10001 (docker run --user), which owns nothing
# here; /work and /tmp are tmpfs mounts given at run time.
WORKDIR /work

# ---- target api ----------------------------------------------------------
FROM ${UBUNTU} AS api
# The API links OpenSSL (std.http's TLS), zlib and zstd; timeout is coreutils.
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      libssl3t64 zlib1g libzstd1 coreutils \
 && rm -rf /var/lib/apt/lists/*
# The Docker command line only (a static binary): the daemon is the host's,
# reached through the socket compose mounts.
COPY --from=docker:27.5.1-cli /usr/local/bin/docker /usr/local/bin/docker
COPY --from=programs /usr/local/bin/api /usr/local/bin/api
# An unprivileged user; compose adds the socket's group (DOCKER_GID).
RUN useradd --system --uid 10010 --no-create-home --shell /usr/sbin/nologin api
USER api
ENV DOCKER_CONFIG=/tmp/docker PORT=8080
EXPOSE 8080
CMD ["/usr/local/bin/api"]
