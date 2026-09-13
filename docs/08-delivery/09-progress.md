# Progress — durable project state

The single place that records implementation status (ADR-0043). Update it in every checkpoint commit.
Everything else in `docs/` describes design; only this file claims what exists and what has run.

## Current state

| Item | Value |
| --- | --- |
| Project | Yeonjae Studio — English manuscripts in the Korean serialized-webnovel tradition |
| Phase | **Checkpoint 0 — corrected planning baseline** (complete pending review) |
| Default branch | `hoplite/ainos-1ac771f8` (baseline commit `2823bb9`) |
| Working branch | `hoplite/prokonnesos-fc9b87c1` (thread branch; PR #1 target: default branch) |
| Application code | none yet — Checkpoint 1 starts the pnpm workspace (ADR-0044) |
| CI | `.github/workflows/planning-validation.yml` runs the planning validator on every push/PR |

## Checkpoints

| # | Name | Branch | Status | PR |
| --- | --- | --- | --- | --- |
| 0 | Corrected planning baseline (audit, ADR-0037…0044, validator, schemas, fixture, policies) | `hoplite/prokonnesos-fc9b87c1` | done, awaiting review | see thread |
| 1 | Repository foundation (pnpm workspace, TS strict, lint/format/test, schema→types, CI, mock provider, CLI skeleton) | `…--build-01-foundation` (stacked on 0) | next | — |
| 2 | Domain, database and canon core | stacked on 1 | planned | — |
| 3 | Narrative identity, prompt registry, gateway | stacked on 2 | planned | — |
| 4 | Context and retrieval | stacked on 3 | planned | — |
| 5 | Chapter-production vertical slice (ch.1 → ch.2 remembers ch.1 → export) | stacked on 4 | planned | — |
| 6 | Quality and long-form validation | stacked on 5 | planned | — |
| 7 | Interface and hardening | stacked on 6 | planned | — |

PR dependency rule: each checkpoint PR is based on the previous checkpoint branch and states its parent;
merge bottom-up. No PR is merged without explicit user authorization.

## Validation commands and latest results

| Command | Purpose | Last result |
| --- | --- | --- |
| `pip install jsonschema && python3 tools/validate-planning-package.py` | schemas, examples, canon-delta union, evidence offsets against fixture manuscripts, cross-file refs, stale terms, truthfulness | **ALL OK** (32 schemas; 14 examples + 1 bundle; 0 contradiction hits) at the Checkpoint 0 head |

Tests not run: none exist yet (no application code). Live-model tests: none executed; nothing in this
repository is evidence of live-model prose quality.

## Known failures / gaps

- Contrast sets: 4 starter sets in the repo (target ≥ 40 before calibration; B-6-3).
- Fixture manuscripts: only ch.9 (accepted) and its rejected draft exist as text; ch.12/ch.14 evidence is
  described, not addressable, until Checkpoint 5 produces them.
- Thresholds in profiles and policies are `uncalibrated`.

## Unresolved risks (see `03-risk-analysis.md`)

R1/R2 (translation-like vs Western-pacing drift) remain the top product risks and are not testable until
Checkpoint 3 (gateway + judges) and Checkpoint 6 (contrast-set regression on live models).

## Next exact tasks (Checkpoint 1)

1. `git checkout -b hoplite/prokonnesos-fc9b87c1--build-01-foundation` from the Checkpoint 0 head.
2. pnpm workspace: `packages/domain` (schema → TypeScript types via `json-schema-to-typescript`, Zod
   lockstep test), `packages/prose` (NFC + code-point utilities + length model), `apps/cli` skeleton,
   `packages/gateway` with `MockProvider`; Vitest, ESLint, Prettier (ignore `examples/**` prose), tsconfig
   strict, Node 22 engines.
3. CI: node workflow (install, typecheck, lint, test, planning validator), secret scanning (gitleaks),
   `pnpm audit` non-blocking report.
4. `.env.example` variable names only; `docs/08-delivery/09-progress.md` update; PR stacked on Checkpoint 0.

## Important decisions log

| Date | Decision | Where |
| --- | --- | --- |
| 2026-09-13 | Lifecycle: `origin` + `status`; approval-locked extraction; accepted on commit | ADR-0037 |
| 2026-09-13 | Five bitemporal change classes; extraction emits transitions only | ADR-0038 |
| 2026-09-13 | `source_story` = fact-bearing timeline kind reached through knowledge; reincarnation reuses prior-loop timelines | ADR-0039 |
| 2026-09-13 | StoryClock: narrative order authoritative; world order partial; calendars; `narrated_at` | ADR-0040 |
| 2026-09-13 | Production Policy = single versioned source of limits/gates; per-dimension gates only | ADR-0041 |
| 2026-09-13 | Issue-override matrix (never / canon_workflow / reviewer / advisory) | ADR-0042 |
| 2026-09-13 | Truthful baseline: starter labels, one progress doc | ADR-0043 |
| 2026-09-13 | Modular monolith first; CLI before API/UI; Temporal after the core loop | ADR-0044 |
