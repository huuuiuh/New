# Progress — durable project state

The single place that records implementation status (ADR-0043). Update it in every checkpoint commit.
Everything else in `docs/` describes design; only this file claims what exists and what has run.

## Current state

| Item | Value |
| --- | --- |
| Project | Yeonjae Studio — English manuscripts in the Korean serialized-webnovel tradition |
| Phase | **Checkpoint 3 — narrative identity, prompt registry, gateway** (complete pending review); Checkpoints 0–2 in PRs #1–#3 |
| Default branch | `hoplite/ainos-1ac771f8` (baseline commit `2823bb9`) |
| Working branch | `…--build-02-domain-canon--build-03-identity-gateway` (stacked on Checkpoint 2, PR #3) |
| Application code | pnpm workspace: `packages/prose`, `packages/domain`, `packages/gateway` (MockProvider skeleton), `packages/db` (migration 0001, `canon.commit_delta`, `canon.rollback_latest`, bitemporal helpers), `packages/canon` (deterministic verifier + acceptance), `packages/narrative` (profile store, composition, Block compiler), `packages/prompts` (24 immutable prompt families v1.0.0, registry, prompt sets), `packages/gateway` (Guard, routing, budget, repair, output-language path, audit; Mock/Replay providers), migration 0002 (llm_calls, prompt_versions, jobs, job_steps), `apps/cli`; 116 tests incl. 19 Postgres integration tests |
| CI | `planning-validation.yml` (validator) + `ci.yml` (Postgres 16 service; types-fresh, typecheck, lint, format, unit + integration tests, CLI smoke, audit, gitleaks) on every push/PR |

## Checkpoints

| # | Name | Branch | Status | PR |
| --- | --- | --- | --- | --- |
| 0 | Corrected planning baseline (audit, ADR-0037…0044, validator, schemas, fixture, policies) | `hoplite/prokonnesos-fc9b87c1` | done, awaiting review | [#1](https://github.com/jsisiwb/New/pull/1) |
| 1 | Repository foundation (pnpm workspace, TS strict, lint/format/test, schema→types lockstep, CI, mock provider, CLI skeleton, code-point/length/language primitives, StoryClock + lifecycle machines, policy loader) | `…--build-01-foundation` (stacked on 0) | done, awaiting review | [#2](https://github.com/jsisiwb/New/pull/2) |
| 2 | Domain, database and canon core (migration 0001; immutable versions; code-point evidence trigger; frame × timeline rule; `canon.commit_delta` with change classes + complete `inverse`; `canon.rollback_latest`; quarantine; bitemporal helpers; verifier; CLI DB commands) | `…--build-01-foundation--build-02-domain-canon` (stacked on 1) | done, awaiting review | [#3](https://github.com/jsisiwb/New/pull/3) |
| 3 | Narrative identity (profiles as data, composition, Block compiler with role variants, both contract hashes, shedding, overflow error), prompt registry (24 families, immutable content-hashed versions, strict variables, prompt sets), gateway (fail-closed Guard, routing, budget guard, bounded repair, truncation, output-language discard→regenerate→reroute, idempotent audit; Mock/Replay/fault providers), migration 0002 (append-only `llm_calls` with both contract hashes, immutable `prompt_versions`, `jobs`/`job_steps`) | `…--build-02-domain-canon--build-03-identity-gateway` (stacked on 2) | done, awaiting review | stacked on #3 |
| 4 | Context and retrieval | stacked on 3 | planned | — |
| 5 | Chapter-production vertical slice (ch.1 → ch.2 remembers ch.1 → export) | stacked on 4 | planned | — |
| 6 | Quality and long-form validation | stacked on 5 | planned | — |
| 7 | Interface and hardening | stacked on 6 | planned | — |

PR dependency rule: each checkpoint PR is based on the previous checkpoint branch and states its parent;
merge bottom-up. No PR is merged without explicit user authorization.

## Validation commands and latest results

| Command | Purpose | Last result |
| --- | --- | --- |
| `pip install jsonschema && python3 tools/validate-planning-package.py` | schemas, examples, canon-delta union, evidence offsets against fixture manuscripts, cross-file refs, stale terms, truthfulness | **ALL OK** (32 schemas; 14 examples + 1 bundle; 0 contradiction hits) |
| `DATABASE_URL=postgres://… pnpm check` | types-fresh → typecheck → lint → format:check → unit + Postgres integration tests → validator | **green**: 18 test files, 116 tests passed (Checkpoint 3 head; 19 of them integration tests on Postgres 16.14) |
| `pnpm cli identity:compile project/…@1 writer_full 2000` | compiles the fixture identity block: both contracts first, 11 sections, 1,272 est. tokens, deterministic hash | ok |
| `pnpm cli prompts:list` | 24 immutable prompt versions + active prompt set id | ok |
| `pnpm cli verify-evidence examples/fixture/manuscripts/ch09.accepted.txt examples/fixture/canon-delta.ch09.json` | code-point evidence verification via the CLI | ok: 8 spans verified |
| `pnpm cli db:migrate … manuscript:import … manuscript:approve … canon:accept … canon:state-at` | end-to-end: import fixture ch.9, approval-lock, verified atomic commit (version 0 → 1), state query at ch.11 returns the venom injury | ok (see PR #3 body) |

Tests not run: none skipped locally. Without `DATABASE_URL` the integration suite skips visibly.
Live-model tests: none executed; nothing in this repository is evidence of live-model prose quality.

## Known failures / gaps

- Contrast sets: 4 starter sets in the repo (target ≥ 40 before calibration; B-6-3).
- Fixture manuscripts: only ch.9 (accepted) and its rejected draft exist as text; ch.12/ch.14 evidence is
  described, not addressable, until Checkpoint 5 produces them.
- Thresholds in profiles and policies are `uncalibrated`.

## Unresolved risks (see `03-risk-analysis.md`)

R1/R2 (translation-like vs Western-pacing drift) remain the top product risks and are not testable until
Checkpoint 3 (gateway + judges) and Checkpoint 6 (contrast-set regression on live models).

## Next exact tasks (Checkpoint 4 — context and retrieval)

1. `git checkout -b …--build-03-identity-gateway--build-04-context-retrieval` from the Checkpoint 3 head.
2. `packages/context`: Active Constraint Set compiler (scope filter, dedupe, stable ids, cap →
   `CONSTRAINTS_OVERFLOW`); pack templates for scene_writer / chapter_planner / continuity_checker /
   extractor; query plan from the contract; structured fetch via `@yeonjae/db` (states, knowledge,
   relationships, promises, previous accepted chapter L1 + verbatim tail per `policy.context.*` + ending hook
   + committed deltas); lexical retrieval (Postgres FTS over accepted text and canon summaries; migration 0003
   `search_documents` with accepted-only trigger); T0–T3 tiering with `PACK_T0_OVERFLOW` / `PACK_T1_OVERFLOW`
   and the degradation ladder; renderer with provenance tags; manifest + `pack_hash`; T0 byte validation.
3. Rejected-draft exclusion tests (T16 through the assembler); determinism tests (same inputs → same hash);
   recall tests on a seeded fixture (distant event retrieved by lexical query); previous-chapter continuity
   test (k−1 summary/tail/hook/deltas present for chapter k).
4. CLI: `pack:build <project> <chapter> <role>` printing the manifest and rendered sections.

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
| 2026-09-14 | Prompt families live in the repo (`packages/prompts/families/<family>/vX.Y.Z/`) as the review surface; the DB mirror (`prompt_versions`) is hash-verified and immutable; `tools/seed-prompt-families.py` authored v1.0.0 and is idempotent | `packages/prompts` |
| 2026-09-14 | Gateway audit rows never contain prompt or output text (hashes + sizes only; outputs live in the artifact store the workflow owns) | `packages/gateway/src/gateway.ts`, migration 0002 |
| 2026-09-14 | Canon boundary is the SQL function: all canon tables carry BEFORE triggers that refuse writes unless `canon.in_commit` is set by `canon.commit_delta`/`rollback_latest`, and refuse DELETE/TRUNCATE outright; `btree_gist` exclusion constraints make overlapping validity impossible; evidence trigger uses Postgres code-point `substring` on NFC text | `packages/db/migrations/0001_canon_core.sql` |
| 2026-09-14 | Toolchain: TypeScript 5.9 (typescript-eslint peer range), Vitest 4, ESLint 10 flat config, Prettier 3, `json-schema-to-typescript` for types with a freshness check in CI, Ajv 2020-12 at runtime; UUIDv7 implemented in-house (no dependency); deterministic script/lexicon output-language check (no statistical language-id dependency) | README.dev.md |
