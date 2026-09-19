# Contributing

Thanks for caring about the n8n client for Cruise. This repo is the public source of truth for
the `n8n-nodes-bytesbrains-cruise` community package.

## Ground rules

- **Never commit a Cruise key** (`cru_live_…`, `cru_demo_…`, `cru_test_…`, `cru_svc_…`) or any
  provider credential. Keys live in n8n credentials or a secret manager on the machine that uses
  them.
- **No telemetry, no second host.** The client talks only to the configured Cruise base URL.
- Open every pull request (features, fixes, docs, hotfixes) **into `dev`**. Only the release
  PR from `dev` targets `main`. See [Branches and releases](#branches-and-releases).
- Keep this repository **public-safe**. Do not paste internal gateway design, private issue
  trackers, credentials, or unpublished roadmap from elsewhere. Public product behaviour
  (base URL, key shapes, `/v1/models`, refusal codes) is fine.

## Setup

```sh
git clone https://github.com/bytesbrains/cruise-n8n.git
cd cruise-n8n
npm ci
```

`npm ci` runs `prepare`, which points `core.hooksPath` at `.githooks/`. **pre-commit**
runs `gitleaks protect` on the staged diff; **pre-push** runs `gitleaks detect` over full
history — both with `.gitleaks.toml` (Cruise key shapes included). Those hooks require
[gitleaks](https://github.com/gitleaks/gitleaks) (`brew install gitleaks`) and fail closed
if it is missing — on purpose.

## Checks

```sh
npm run check:package  # n8n community package.json contract
npm run build          # TypeScript → dist/ (+ icon copy)
npm test               # vitest
npm run secrets:scan   # gitleaks (requires gitleaks on PATH)
```

CI runs the secrets scan (`check`) and build/test (`plugin`) on every pull request and on
pushes to `main` / `dev`.

## Trying against the demo

1. Install the built package into a local n8n (or use the OpenAI credential recipe in the README).
2. Point the credential at `https://cruise-demo.bytesbrains.net/v1` with a `cru_demo_` key.
3. Call a lane id from `GET /v1/models` and confirm the demo ledger saw the request.

## Branches and releases

```text
feature/fix/deps ──PR──▶ dev ──release PR──▶ main ──tag vX.Y.Z──▶ npm
```

| Branch | Takes PRs from | Required checks | Notes |
| --- | --- | --- | --- |
| `dev` | any branch (incl. Dependabot) | `check`, `plugin` | Integration branch |
| `main` | `dev` only | `check`, `plugin`, `base-branch`, 1 approval, up to date | Release branch |

Both branches are protected: no force-push, no deletion. `base-branch`
(`.github/workflows/branch-policy.yml`) fails any PR into `main` whose head is not this repo's
`dev`. `v*` tags are protected by the `release-tags` ruleset: only admins can create them, and
nobody can move or delete one.

A release is a **tag**, not a merge — same rule as the other Cruise public clients.

1. In a PR into `dev`, bump `package.json` `version` and move `CHANGELOG.md`'s `Unreleased`
   notes under the new version.
2. Open the release PR `dev` → `main` titled `Release X.Y.Z`; merge once `check`, `plugin` and
   `base-branch` are green.
3. Tag the merge commit on `main` and push:
   `git checkout main && git pull && git tag vX.Y.Z && git push origin vX.Y.Z`.
4. `release.yml` checks the tag matches `package.json` and points at a commit on `main`, runs
   `npm run pack:check`, then publishes to npm via OIDC Trusted Publisher (optional break-glass
   `NPM_TOKEN`).
5. After the release, confirm `dev` and `main` point at the same tree. If `main` moved on its own
   (an admin bypass), open a PR `main` → `dev` to sync before the next feature lands.

Never publish from a merge alone, and never move a published tag — cut the next patch version
instead. Verify the packed tarball locally with `npm run pack:check` before tagging.

Configure **Trusted Publisher** on npmjs.com for this repository and workflow `release.yml`
before the first real tag.
