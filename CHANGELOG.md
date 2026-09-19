# Changelog

All notable changes to `@bytesbrains/n8n-nodes-cruise` are documented here.

## Unreleased

## 0.1.1 — 2026-09-19

- Fix release workflow: upgrade npm to 11.5.1 only immediately before `npm publish`,
  so Vitest/Rolldown optional native bindings are not dropped by npm's optional-deps
  bug during `npm ci` / test (v0.1.0 tag publish failed on that).

## 0.1.0 — 2026-09-19

- **Cruise Chat Model** sub-node (`lmChatCruise`) via `@n8n/ai-node-sdk` for AI Agent / LangChain
  chains; shared `utils/cruise-refusal` surfaces `budget_exhausted` / `wallet_exhausted` on both
  the standalone and Chat Model paths.
- Repo posture: pin Actions to commit SHAs, add `AGENT.md` and `.editorconfig` (#6).
- Branded README (Cruise logo, product / npm / demo badges and link tables) matching the other
  public Cruise clients; node icon refreshed.
- First scoped publish as `@bytesbrains/n8n-nodes-cruise` (unscoped
  `n8n-nodes-bytesbrains-cruise@0.0.1` withdrawn).

## 0.0.1 — 2026-09-19

- Initial public scaffold: Cruise API credential, Cruise chat node, CI / branch-policy / release
  workflows matching the other BytesBrains Cruise public clients. Published once under the
  unscoped name, then renamed.
