<p align="center">
  <img src="https://bytesbrains.com/brand/cruise-logo-480.png" alt="BytesBrains Cruise" width="280" />
</p>

<h1 align="center">BytesBrains Cruise for n8n</h1>

<p align="center">
  Every model your Cruise key can reach — in n8n agents and workflows —<br />
  with budgets, per-project keys, and one cost ledger that stay on the gateway.
</p>

<p align="center">
  <a href="https://bytesbrains.com/cruise"><img src="https://img.shields.io/badge/Product-bytesbrains.com%2Fcruise-111111" alt="Product" /></a>
  <a href="https://www.npmjs.com/package/@bytesbrains/n8n-nodes-cruise"><img src="https://img.shields.io/npm/v/@bytesbrains/n8n-nodes-cruise?label=npm" alt="npm" /></a>
  <a href="https://docs.n8n.io/integrations/community-nodes/installation/"><img src="https://img.shields.io/badge/n8n-Community%20Nodes-EA4B71" alt="n8n Community Nodes" /></a>
  <a href="https://github.com/bytesbrains/cruise-n8n/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/bytesbrains/cruise-n8n/ci.yml?branch=main&label=CI" alt="CI" /></a>
</p>

---

## What this is

[BytesBrains Cruise](https://bytesbrains.com/cruise) is one OpenAI-compatible endpoint in front of
every model provider. This repository is the **n8n community node**: a Cruise credential and chat
node you install by name, plus a verified recipe for the built-in OpenAI Base URL path.

Your keys, budgets and ledger stay on the gateway. n8n only holds a `cru_` key and talks to the
base URL you configure.

**Published as** [`@bytesbrains/n8n-nodes-cruise`](https://www.npmjs.com/package/@bytesbrains/n8n-nodes-cruise)
on [npm](https://www.npmjs.com/package/@bytesbrains/n8n-nodes-cruise).

| | |
| --- | --- |
| **Product** | [bytesbrains.com/cruise](https://bytesbrains.com/cruise) |
| **npm** | [`@bytesbrains/n8n-nodes-cruise`](https://www.npmjs.com/package/@bytesbrains/n8n-nodes-cruise) |
| **Source** | [bytesbrains/cruise-n8n](https://github.com/bytesbrains/cruise-n8n) |
| **Production API** | `https://cruise.bytesbrains.net/v1` |
| **Demo API** | `https://cruise-demo.bytesbrains.net/v1` |

---

## Install the community node (preferred)

In **self-hosted** n8n: **Settings → Community Nodes → Install**, then enter:

```text
@bytesbrains/n8n-nodes-cruise
```

1. Create a **BytesBrains Cruise API** credential — paste your `cru_…` key and set the base URL
   (include `/v1`).
2. Add the **Cruise** node to a workflow.
3. Set **Model** to a Cruise id from `GET /v1/models` (e.g. `bb/chat-assistant` or
   `bb/agentic-coding`).
4. Run.

Never put the key in a synced settings file or a committed workflow JSON — use n8n credentials.

### Try it before anyone issues you a live key

Point the credential at the demo and use a `cru_demo_` key:

| Field | Value |
| --- | --- |
| **API Key** | `cru_demo_…` |
| **Base URL** | `https://cruise-demo.bytesbrains.net/v1` |

That host holds production’s model ids exactly, every price zero, and **no** provider credential
in the deployment. Answers are fabricated. It costs nothing to rehearse.

For real traffic, switch the base URL to `https://cruise.bytesbrains.net/v1` and use a
`cru_live_` key issued with `--rate-limit` / `--account-rate-limit` for any n8n host you do not
control.

---

## Works today without this package

n8n’s built-in OpenAI credential already has a Base URL field. Point it at Cruise and use the
**OpenAI Chat Model** sub-node inside an AI Agent / LangChain chain:

| Field | Value |
| --- | --- |
| **API Key** | your `cru_` key |
| **Base URL** | `https://cruise.bytesbrains.net/v1` (or the demo host) |
| **Model** | a Cruise id from `GET /v1/models` (expression mode if the dropdown misbehaves) |

This package exists so Cruise shows up **by name**, with refusals surfaced as Cruise codes rather
than a generic OpenAI quota error.

---

## Model ids

**Name the model as Cruise names it**, from `GET /v1/models` with your key — not as the upstream
provider does. A hardcoded `gpt-4o` reaches Cruise as a model it does not route.

A `bb/…` id is a **lane**: Cruise picks a member per request. Prefer a lane for agent work
(`bb/agentic-coding`); pin a specific model id only when you need that vendor.

---

## When Cruise refuses

Cruise answers spending refusals with HTTP `429` and OpenAI’s `insufficient_quota` on purpose, so
stock OpenAI clients fail correctly. **Branch on `error.code`, never on HTTP status alone** —
several codes share `429` and mean different operator actions.

| Code | HTTP (typical) | Meaning | What to do |
| --- | --- | --- | --- |
| `budget_exhausted` | 429 | The **project** period cap is spent. Often carries `Retry-After`. | Wait for the period to reset, or ask the project owner to raise the cap. |
| `wallet_exhausted` | 429 | The account **prepaid wallet** is empty. **No** useful `Retry-After`. | Top up or get a credit grant. Do **not** retry in a loop. |
| `measurement_stale` | 429 | That model’s measurement aged out, so Cruise will not route it. | Call a lane (`bb/…`) or another id from `GET /v1/models`. |
| `model_not_found` | 404 | No such model or lane, or nothing in the lane this key may reach. | Refresh ids from `GET /v1/models`. |
| `permission_error` | 403 | The key is valid but not scoped for that model. | Pick a model the key reaches, or ask for a wider key. |

---

## Ground rules for this client

- **Holds a `cru_` key, never a provider credential.** Blast radius is one revocable, budget-capped
  key.
- **Key in n8n credentials**, never in a committed workflow or a synced settings file.
- **Models fetched, never shipped** — type the id Cruise publishes for your key.
- **Traffic only to the configured Cruise base URL.** No telemetry, no second host.
- **Rehearse on the demo first.**

See [SECURITY.md](SECURITY.md) for reporting.

---

## Develop

```sh
git clone https://github.com/bytesbrains/cruise-n8n.git
cd cruise-n8n
npm ci
npm run build
npm test
```

Branch flow (same as the other public Cruise clients):

```text
feature/fix/deps ──PR──▶ dev ──release PR──▶ main ──tag vX.Y.Z──▶ npm
```

A merge is never a release. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Product & package

| | |
| --- | --- |
| Product | [bytesbrains.com/cruise](https://bytesbrains.com/cruise) |
| Production API | `https://cruise.bytesbrains.net/v1` |
| Demo API | `https://cruise-demo.bytesbrains.net/v1` |
| npm | [@bytesbrains/n8n-nodes-cruise](https://www.npmjs.com/package/@bytesbrains/n8n-nodes-cruise) |
| Source | [bytesbrains/cruise-n8n](https://github.com/bytesbrains/cruise-n8n) |
| Issues | [github.com/bytesbrains/cruise-n8n/issues](https://github.com/bytesbrains/cruise-n8n/issues) |
| n8n Community Nodes | [Installation docs](https://docs.n8n.io/integrations/community-nodes/installation/) |

---

## Licence

See [`LICENSE.txt`](LICENSE.txt).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs land on `dev` by default.
