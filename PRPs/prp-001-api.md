## FEATURE: The code-running API — compile, run, test and format Lugha submitted from the site, safely, in a gVisor sandbox

Status: **approved by the owner, 2026-11-07**, CONTENT sentences included. Amended the same day (approved): a root `docker-compose.yml` runs Caddy and the API, and builds the sandbox image.

## OBJECTIVE

A visitor presses Run, Test or Format in Learn, Examples or Playground and gets back exactly what `lughac` and their program printed: compile errors with their codes and lines, the program's output and exit code, test results, or formatted code. A program that misbehaves (loops forever, eats memory, floods output, reaches for the network or the machine) is stopped with a plain sentence, and the next request works normally. Nothing a visitor sends can reach the server outside the sandbox.

## CONTEXT

- Read first: `CLAUDE.md` (SECURITY, ARCHITECTURE), `DECISIONS.md`, `docs/ui/target/` (Learn, Examples and Playground show how results appear).
- Creates `services/api/`: the API service (Lugha), the sandbox runner (Lugha, inside the container), the sandbox image, the Caddy configuration and the tests.
- Relied on in `lughac` 0.1.0 (Lugha v17), each checked 2026-11-07:
  - `lughac build [-O 0|2] FILE -o OUT` and `--diagnostics json` (one JSON object per diagnostic on stderr: `severity`, `code`, `message`, `file`, `span`, `labels`, `help`).
  - `lughac test --json` (one object per test: `test`, `file`, `line`, `status`, `output`, `ms`; then `summary`) and `--timeout SECS`.
  - `lughac fmt PATHS` (rewrites in place; errors as text only, exit 1).
  - `lughac run` is not used: a compile error and a program exiting 1 both exit 1 and share stderr.
  - A panic exits 101 with `panic: … at FILE:LINE:COL` on stderr.
  - `std.http` (server), `std.json`, `std.toml`, `std.process` (`run`, `run_with`; never a shell), `std.fs`, `std.time`.
  - **Spec §6: `std.process` blocks the one OS thread, so every green thread waits.** Hence one request at a time (decision API-7).
- External: gVisor `runsc` as a Docker runtime, as the Go playground runs it ([sandbox README](https://go.googlesource.com/playground/+/HEAD/sandbox/)); Compiler Explorer's lesson that every step touching untrusted output must be sandboxed ([write-up](https://xania.org/202506/how-compiler-explorer-works)).
- Decisions: API-1 to API-9 below, recorded in DECISIONS.md. Open decision O1 (the web stack) does not block this PRP: the API is independent of it.

## REQUIREMENTS

### Must Do

**Operations** (HTTP, JSON bodies, behind Caddy):

| Route | Does |
|---|---|
| `POST /api/run` | `lughac build`, then the program, in one fresh sandbox |
| `POST /api/test` | `lughac test --json --timeout 5` in one fresh sandbox |
| `POST /api/format` | `lughac fmt` on a copy of the files in one fresh sandbox; returns the files that changed |
| `GET /api/version` | the `lughac` version inside the sandbox image, for the site's footer |

**Requests.** Every request is checked before any sandbox starts; a bad one gets 400 and a sentence.
- `files`: a list of `{ path, text }`. At most 20 files, 256 KB in total, UTF-8.
- A path is `lugha.toml`, or `src/…/*.la` or `test/…/*.la`: relative, `/`-separated, each part starting with a letter, digit or `_`, no `..`, no hidden parts, no duplicates.
- `lugha.toml` (optional; a default is used without one) may hold only `[package]` with `name`, `version` and `source = "src"`, parsed with `std.toml`. `[link]`, `[packages]` and anything else are refused with a sentence naming the part.
- Run also takes `entry` (default `src/main.la`, which must be in `files`), `args` (at most 32, each at most 1 KB), `stdin` (at most 64 KB) and `opt` (`0` or `2`).
- No other field is accepted: no environment, working directory, CPU target or compiler flag. Unknown fields are refused.

**Responses.** One JSON response when the work is done; no streaming (API-4).
- Run: `compile` = `{ ok, diagnostics }` with `lughac`'s JSON diagnostics passed through unchanged (warnings included); `program` (only when it compiled) = `{ exit_code, stdout, stderr, stopped, truncated }`, where `stopped` is `null`, `"time"`, `"memory"` or `"output"`.
- Test: `compile` as above when the tests don't build; otherwise `tests` (one object per `lughac test --json` line) and `summary`.
- Format: `files` (only those that changed, with their new text), or `error` holding `lughac fmt`'s text when it can't parse a file.
- stdout and stderr are each capped at 64 KB; `truncated` says which were cut.
- A service failure is 503 with `{ "error": "Couldn't run your code right now. Try again in a moment." }`. Responses never contain server paths, internal errors or anything from the host.

**Limits** (API-5):

| | Compiling (`build`, `fmt`, `test`'s build) | Running (the program; each test) |
|---|---|---|
| Wall time | 30 s | 5 s; a test 5 s, the whole test run 20 s |
| Memory | 1 GB (the container) | 256 MB |
| Processes | what `lughac` and `cc` need | 16 |
| Output | diagnostics capped at 64 KB | stdout, stderr: 64 KB each |
| Disk | a scratch folder in the container | 16 MB scratch, discarded |
| Network | none | none |

- Per IP address, enforced by the API from Caddy's `X-Forwarded-For` (trusted only from localhost): at most 20 requests a minute; past that, 429 and "You're running code very fast. Wait a minute and try again."
- A stopped program is a sentence in the response, never an error status: "Your program was stopped after 5 seconds.", "…because it used more than 256 MB of memory.", "Its output was cut off at 64 KB."

**Sandbox** (API-6):
- Every request gets a fresh container: `docker run --rm --runtime=runsc --network=none --read-only --user` a non-root user, `--cap-drop=ALL`, `--security-opt=no-new-privileges`, `--pids-limit`, `--memory=1g`, a `--tmpfs` scratch folder of 16 MB, and the pinned sandbox image. Arguments are a list passed to `std.process`; never a shell.
- The image holds the pinned `lughac`, `cc`, the coreutils/util-linux tools the runner needs (`timeout`, `prlimit`), and the runner. Built from `services/api/sandbox/Dockerfile`. If `lughac` has a runtime cache, it is warmed when the image is built.
- **The runner** is a small Lugha program inside the container. It reads one job as JSON on stdin, writes the files into the scratch folder, runs `lughac` and the program under the running limits (via `timeout` and `prlimit`, never a shell), and prints one JSON result on stdout. All untrusted work happens in the container, compiling included.
- **The API reads only the container's stdout, stderr and exit status.** It never opens a file the container wrote, and mounts nothing from the host into the container except the image.
- The API bounds the whole container with an outer wall-time limit (45 s), and kills and removes it after that. A clean-up job removes any sandbox container older than 2 minutes.

**One request at a time** (API-7): the API is a single Lugha process. While a sandbox runs, other connections wait in the kernel's queue. Caddy's upstream timeout is 60 s, and the site shows "The server is busy. Try again in a moment." when a request times out. When `lughac` gains non-blocking `std.process`, the API serves requests concurrently with no change to its interface.

**Hosting** (API-8): one DigitalOcean droplet (2–4 vCPU, 4–8 GB) with Docker, `runsc` registered as a runtime in its default (systrap) mode, and Docker Compose. The domain is to be decided.

**Compose** (API-10): `docker-compose.yml` at the repository root runs the long-lived services; the sandbox containers are never compose services, since the API starts one per request.
- `caddy`: ports 80 and 443; HTTPS; request bodies capped at 512 KB; the static site (`services/ui-web`'s build folder, later); `/api/*` proxied to `api`. Configuration in `deploy/Caddyfile`.
- `api`: the Lugha API, built from `services/api/Dockerfile`, on the compose network only (no published port), running as a non-root user, with `/var/run/docker.sock` mounted so it can start sandbox containers. That socket is root-equivalent on the host: the API stays small and strict, and nothing from a request reaches the `docker run` arguments except through checked fields.
- `sandbox`: build-only (a compose profile, never started), building `services/api/sandbox/Dockerfile` into the pinned, tagged sandbox image that `api` runs per request.

Deploying, locally or on the droplet, is `docker compose build` (with the sandbox profile) and `docker compose up -d`.

### Must NOT Do
- Never compile, format or run submitted code outside the sandbox, and never on the host "just to check".
- Never use a shell, or build a command, path or argument from submitted text beyond the checked file paths and the visitor's own `args` (passed as list items to the program inside the sandbox).
- Never accept `[link]`, `[packages]` or git packages; never give the sandbox network access.
- Never store submitted code, outputs or IP addresses beyond the rate limiter's per-minute counts in memory. No logs of submitted code.
- No login, sessions, cookies or stored share links (API-9).
- No `lughac check` endpoint, no streaming (API-2, API-4).
- No content endpoints: lessons and examples are static files (API-1).
- Never work around a missing `lughac` feature beyond API-7, which the owner approved: record it and stop.

## DESIGN

**Layout** (every file ≤ 500 lines):

```
services/api/
  lugha.toml
  src/
    main.la            the API's entry: read the port, start the server
    checks/            used by both programs
      limits.la        every limit as a constant
      manifest.la      checking lugha.toml with std.toml
      files.la         checking files: paths, counts, total size, lugha.toml
      requests.la      decoding requests: JSON, known fields, entry, args, stdin, -O
      job.la           the job the API hands the runner
    server/            the API only
      ratelimit.la     per-IP counts per minute
      sandbox.la       the docker run for one job; reading its result
      routes.la        the four routes; each outcome as a status and JSON
    runner/            the runner only (inside the container)
      main.la          the runner's entry (imports as api.checks…, api.runner…)
      steps.la         the commands it runs, with their limits
      outcome.la       what they printed, as the JSON result
  Dockerfile           both images: targets `sandbox` and `api`, sharing one lughac build
  sandbox/warm/        the program that warms lughac's object cache in the sandbox image
  test/                one test file per module; sandbox tests; hostile/ programs
  build/               built binaries (ignored by git)
deploy/
  Caddyfile            HTTPS, proxy, body cap, static site
  cleanup              the stale-container clean-up job (the cleanup service)
docker-compose.yml     caddy, api, cleanup, and the build-only sandbox image (API-10)
```

**Errors.** Each module has its own error enum (`RequestError`, `ManifestError`, `SandboxError`), each variant mapped to a sentence in `routes.la`. Expected failures are `Result`; panics are bugs. A visitor's compile error, panic or stopped program is a normal result, not an error.

**Runner ↔ API.** The job and result are JSON over the container's stdin and stdout, versioned (`"v": 1`). A result the API can't decode, a missing result or a container that outlives the outer limit is a `SandboxError`: 503 with the service sentence.

**Risk to settle while building:** the runner must cap a program's output at 64 KB without holding unbounded output in memory first (a program can print gigabytes in 5 s). If `std.process` can't bound what it collects, the runner sends the program's output to files in the 16 MB scratch folder under `prlimit --fsize`, or the gap is recorded for `lughac` (CLAUDE.md: no workarounds). Either way the container's 1 GB cap stops the worst case.

**Security notes for the owner's review:** this whole PRP is security-sensitive (CLAUDE.md, SECURITY). Points to check: the `docker run` flags; the runner's limits; the Docker socket mounted into the `api` service (root-equivalent on the host, so the API itself must stay small and strict); the Caddy body cap; the clean-up job.

## CONTENT

Every sentence a visitor can see from the API, for the owner to approve:
- "Couldn't run your code right now. Try again in a moment."
- "The server is busy. Try again in a moment." (shown by the site on a timeout)
- "You're running code very fast. Wait a minute and try again."
- "Your program was stopped after 5 seconds."
- "Your program was stopped because it used more than 256 MB of memory."
- "Its output was cut off at 64 KB."
- Request errors, one per check, e.g. "lugha.toml can only have a [package] section here; [link] isn't allowed in the browser.", "Too many files: the limit is 20.", "Your code is too big: the limit is 256 KB in total."

## TESTS

Unit (`lughac test services/api/test`):
- [ ] Each path rule: accepted paths; refused absolute paths, `..`, hidden parts, other extensions, duplicates, too many files, too large.
- [ ] `lugha.toml`: the default; `[package]` accepted; `[link]`, `[packages]`, unknown sections, invalid TOML refused with their sentences.
- [ ] Run fields: entry missing from files, too many or too long args, stdin too large, `opt` other than 0 or 2, unknown fields.
- [ ] The rate limiter: the 21st request in a minute is refused; the count resets.
- [ ] The docker argument list contains every required flag and nothing from the request.
- [ ] Results: compile errors passed through unchanged; exit codes; panics (101); each `stopped` value; truncation; an undecodable runner result → 503.

Sandbox (skipped with "no sandbox" without Docker and `runsc`):
- [ ] The five Learn steps and the five examples give exactly their recorded output.
- [ ] E0501 comes back as a diagnostic with code, span, labels and help.
- [ ] A passing and a failing `@test`; tests that don't compile.
- [ ] Format: an unformatted file comes back formatted; a formatted one comes back unchanged; a syntax error returns its text.
- [ ] Arguments and stdin reach the program (`args()`, `read_line()`).

Hostile (each stopped with the right sentence; the next request then succeeds):
- [ ] An infinite loop → "time". [ ] Allocating forever → "memory". [ ] Printing forever → "output", within 64 KB.
- [ ] A fork bomb via `std.process` → stopped by the process limit.
- [ ] `std.http` / `std.net` to the internet → fails with Lugha's normal error.
- [ ] Writing outside the scratch folder → fails. [ ] Reading the API's files or host paths → not there.
- [ ] `extern fun system(cmd: string): i32` and raw system calls → contained by gVisor; nothing reaches the host.
- [ ] `include_str("../../etc/passwd")` and similar at compile time → E0447 or nothing of the host's.
- [ ] A `lugha.toml` with `[link]` or `[packages]` → refused before any container starts.
- [ ] Symlinks planted in the scratch folder → the API is unaffected (it never reads the container's files).
- [ ] A request during another's run waits and then succeeds.

## ACCEPTANCE
- [ ] `lughac fmt --check services/api` is clean and `lughac test services/api/test` passes (sandbox tests skip only with "no sandbox").
- [ ] On a machine with Docker and `runsc`, the sandbox and hostile suites pass.
- [ ] Every sentence in CONTENT is approved by the owner.
- [ ] The owner has reviewed the sandbox flags, the runner, the Caddy configuration and `docker-compose.yml`.
- [ ] `docker compose build` (with the sandbox profile) and `docker compose up -d` bring the site up locally; `/api/version` answers through Caddy.
- [ ] For the owner, on the droplet before it is public: run the Learn steps and an example through the API, try an infinite loop, and check that a second request during it waits and then works.
