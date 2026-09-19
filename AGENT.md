# AGENT.md — guidance for agents working in this repository

## What this is

Public **n8n community node** for [BytesBrains Cruise](https://bytesbrains.com/cruise):
`@bytesbrains/n8n-nodes-cruise` — Cruise API credentials, a standalone Cruise chat node, and a
LangChain **Chat Model** sub-node for AI Agent / chain workflows.

Cruise holds provider keys, project budgets, and the cost ledger. This repo only ships the n8n
side: present a `cru_` key to a Cruise base URL and call Cruise model / lane ids from
`GET /v1/models`.

Install from [npm](https://www.npmjs.com/package/@bytesbrains/n8n-nodes-cruise) via n8n
**Settings → Community Nodes**.

## Commands

```sh
npm ci                 # installs deps; prepare → core.hooksPath=.githooks
npm run build          # tsc → dist/ (+ icon copy)
npm test               # vitest
npm run check:package  # n8n community package.json contract
npm run secrets:scan   # gitleaks (requires gitleaks on PATH)
```

CI jobs `check` (secrets scan) and `plugin` (build/test) run on every PR and on pushes to
`main` / `dev`.

## Conventions a change must honour

- **Never commit a Cruise key** (`cru_live_…`, `cru_demo_…`, `cru_test_…`, `cru_svc_…`) or any
  provider credential. Keys live in n8n credentials or a secret manager.
- **No telemetry, no second host.** Traffic only to the configured Cruise base URL.
- **Open PRs with base `dev`** — features, fixes, docs and hotfixes alike. Only the `dev` → `main`
  release PR targets `main` (enforced by the `base-branch` check). Do not force-push `main` or
  `dev`.
- Keep the tree **public-safe**. Do not paste internal gateway design, private trackers, or
  unpublished roadmap. Public product behaviour (base URL, key shapes, `/v1/models`, refusal
  codes) is fine.
- Model ids are **Cruise ids** from `GET /v1/models` for the presented key — never invent
  upstream provider ids (`gpt-4o`, …). Prefer lanes (`bb/…`) over pinned models unless a pin is
  required.
- Branch Cruise refusals on `error.code` (`budget_exhausted`, `wallet_exhausted`,
  `measurement_stale`, …), not on HTTP status alone. Shared helpers live in `utils/`.
- Package name must stay `@bytesbrains/n8n-nodes-cruise` (or another `@scope/n8n-nodes-*`) —
  n8n Community Nodes reject names without the `n8n-nodes-` segment.
- `@n8n/ai-node-sdk` stays a **peerDependency** (and `n8n.aiNodeSdkVersion: 1`): n8n hosts
  supply it at runtime. Bump `aiNodeSdkVersion` when adopting a new SDK major — do not invent
  a parallel versioning scheme.
- A release is a **tag on `main`**, not a merge. Workflow `release` publishes to npm on `v*` tags
  that point at `main` (`npm run pack:check` first). Never create, move or delete a `v*` tag
  unless asked — see `CONTRIBUTING.md`.

## Layout

| Path | Role |
| --- | --- |
| `credentials/` | `CruiseApi` credential (key + base URL) |
| `nodes/Cruise/` | Standalone chat node |
| `nodes/LmChatCruise/` | AI Agent / chain Chat Model sub-node (`@n8n/ai-node-sdk`) |
| `utils/` | Shared refusal formatting |
| `test/` | Package contract + node surface tests |
| `media/` | Local copy of the Cruise wordmark |
| `.github/workflows/ci.yml` | Required `check` + `plugin` |
| `.github/workflows/branch-policy.yml` | Required `base-branch` for PRs into `main` |
| `.github/workflows/release.yml` | npm publish on `v*` tags on `main` (OIDC Trusted Publisher) |

## Open work

See GitHub issues — notably [#1](https://github.com/bytesbrains/cruise-n8n/issues/1) (v0.1.0
ship checklist) and the gateway epic
[bytesbrains-cruise#482](https://github.com/bytesbrains/bytesbrains-cruise/issues/482).
