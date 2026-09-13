# ADR-0037: One manuscript lifecycle — approval-locked extraction, accepted-on-commit

- **Status:** Accepted
- **Date:** 2026-09-13
- **Deciders:** engineering agent (Checkpoint 0 audit), with the planning package as the reviewed input

## Context
The planning package used "approved" and "accepted" for overlapping ideas. `manuscript_versions.kind`
mixed content provenance (`draft`, `revision`, `candidate`) with lifecycle status (`approved`, `accepted`,
`retconned`); the glossary and ADR-0009's title said canon comes from *accepted* chapters while the same
documents said extraction runs on *approved* versions; the executive summary called Semi-automatic gating
"auto-accepted"; `chapter-contract.status` reused `approved` for a contract that is merely frozen for
production. Reading these together made it look as if a chapter had to be accepted before the extraction
that makes it accepted could run.

## Decision
1. **Manuscript versions carry two orthogonal fields.** `origin` records content provenance
   (`assembled | revision | candidate | retcon | imported`, schema `common.manuscriptOrigin`). `status`
   records the lifecycle (`working | approved | accepted | superseded | retconned | rejected`, schema
   `common.manuscriptStatus`). Data-architecture, API, UI and tests use these two fields; `kind` is retired.
2. **The authoritative chapter lifecycle is:**
   `planned → drafting → drafted → evaluating → revising → review_pending → approved → extracting →
   reconciling → verifying → committing → accepted → (stale | superseded | retconned)`, with
   `needs_attention` reachable from any production state and `rejected` reachable from any pre-accepted
   state by user action. These names are used verbatim in requirements, schemas, workflow docs, database
   design, tests, API verbs (`:approve`) and UI labels.
3. **`approved` means approval-locked for extraction.** The human or policy gate produces an immutable
   `approved` manuscript version; that version — and only that version — is the input to canon
   extraction. It is not yet canon. Nothing may be extracted from a `working` version.
4. **`accepted` is set only inside the atomic canon commit.** `canon.commit_delta` applies the verified
   delta, bumps the canon version once, and marks the manuscript version and chapter `accepted` in the same
   transaction. A failed commit leaves the version `approved` and canon untouched.
5. **Canon is therefore "from accepted chapters" and extraction is "from approval-locked versions"** — the
   two statements describe the same version at two points of the same transaction boundary, and documents
   must say which one they mean. Anything that *reads* canon (packs, summaries, indexes, exemplars) uses
   `accepted`; anything that *proposes* canon (extraction, reconciliation, verification) uses `approved`.
6. **Gates approve; commits accept.** Modes differ only in who approves: Assisted = human, Semi-automatic
   and Autopilot = policy (per-dimension thresholds, ADR-0041). "Auto-accept" is not a concept; the
   policy *approves*, and acceptance follows from the commit.
7. **Chapter-contract status renames `approved` → `locked`** (`draft | validated | locked | stale |
   superseded | realized`) so that the word "approved" refers to manuscripts only. The API verb remains
   `contract:approve` because the user action is approval; the resulting state is `locked`.
8. **Evidence spans may reference `approved`, `accepted`, `superseded` and `retconned` versions** (all are
   immutable), never `working` or `rejected`. Exemplars, search documents and summaries reference only
   `accepted` versions.

## Alternatives considered
- Keep one `kind` column and document the overlap — the ambiguity is exactly what produced the circular
  reading; two fields cost nothing.
- Rename `approved` to `locked` for manuscripts too — "approve" is the user-facing action everywhere in the
  UI and API; keeping the manuscript state `approved` and qualifying it as *approval-locked* in prose is
  clearer than a new word.

## Consequences
- Glossary, executive definition, ADR-0009 (amended note), canon/temporal doc §1.1/§4/§7, data
  architecture §5/§12, diagrams, chapter-contract schema and example, fixture story, testing strategy and
  Definition of Done updated in the Checkpoint 0 change.
- Validator rule: the phrases "auto-accept", "kind='accepted'" and "kind='approved'" are flagged as stale
  lifecycle language outside the allowlisted correction documents.
