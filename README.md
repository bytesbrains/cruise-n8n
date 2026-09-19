# BytesBrains Cruise for n8n

[BytesBrains Cruise](https://bytesbrains.com/cruise/) is one OpenAI-compatible endpoint in
front of every model provider, with per-project keys, budgets that stop a runaway loop, and a
ledger of every request. This repository is the **n8n community node** for that gateway.

| | |
| --- | --- |
| **Product** | [bytesbrains.com/cruise](https://bytesbrains.com/cruise) |
| **npm** | `@bytesbrains/n8n-nodes-cruise` (Community Nodes install) |
| **Gateway** | `https://cruise.bytesbrains.net/v1` |
| **Demo** | `https://cruise-demo.bytesbrains.net/v1` |

## Install

In self-hosted n8n: **Settings → Community Nodes → Install**, then enter:

```text
@bytesbrains/n8n-nodes-cruise
```

Create a **BytesBrains Cruise API** credential with your `cru_…` key and base URL. Add the
**Cruise** node to a workflow, set a model id from `GET /v1/models` (e.g. `bb/chat-assistant`
or `bb/agentic-coding`), and run.

### Works today without this package

n8n's built-in OpenAI credential already has a Base URL field. Point it at Cruise and use the
**OpenAI Chat Model** sub-node inside an AI Agent:

| Field | Value |
| --- | --- |
| **API Key** | your `cru_` key |
| **Base URL** | `https://cruise.bytesbrains.net/v1` |
| **Model** | a Cruise id from `GET /v1/models` (expression mode if the dropdown misbehaves) |

Rehearse on the demo first with `https://cruise-demo.bytesbrains.net/v1` and a `cru_demo_` key.

## What this client holds to

- **Cruise keys only** — never a provider credential. Issue with `--rate-limit` and
  `--account-rate-limit` for any n8n host you do not control.
- **Key in n8n credentials**, never in a committed workflow JSON or a synced settings file.
- **Models fetched, never shipped** — type the id Cruise publishes for your key.
- **No traffic anywhere but the configured base URL.**
- **Refusals by `error.code`** — `budget_exhausted` and `wallet_exhausted` are different
  sentences even when both are HTTP 429.

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

See [`CONTRIBUTING.md`](CONTRIBUTING.md). A merge is never a release.

## Licence

See [`LICENSE.txt`](LICENSE.txt).
