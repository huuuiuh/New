# ADR-0042: Issue-override matrix — what a reviewer may waive, and what needs a canon workflow

- **Status:** Accepted
- **Date:** 2026-09-13
- **Deciders:** engineering agent (Checkpoint 0 audit)

## Context
FR-5.4 allowed "explicit user override" of major issues generically, and the UI plan offered a single
`override(issue_ids, reason)` action. Some issue kinds are objective corruption (non-English prose,
truncation, invalid structured output, evidence mismatch); overriding them would accept a broken artifact.
A contradiction with a *locked* fact is not a style opinion either: either the manuscript is wrong (patch)
or canon is wrong (correction/retcon). Treating those as "style overrides" would let canon drift silently.

## Decision
Every `issue.kind` has an **override class**, stored in the Production Policy (ADR-0041) and enforced by
the gate:

| Class | Meaning | Kinds (starting assignment) |
| --- | --- | --- |
| `never` | Cannot be overridden by anyone; the artifact must be regenerated or repaired | `non_english_output`, `truncated_output`, `invalid_structured_output`, `format_drift` (screenplay/script), `content_restriction` (unapproved prohibited content), `evidence_integrity` (quote/offset mismatch), `partial_commit`, `stale_canon`, `frame_error` (invalid reality-frame mutation), `knowledge_leak` of a **secret** |
| `canon_workflow` | Cannot be waived with a reason; requires a **correction**, **retcon**, or **justified locked-fact change** through the canon workflow (ADR-0038), after which the check is re-run | `canon_contradiction` with a locked fact, `timeline_error` against a `must_happen`, `requirement_violation` of a hard requirement, `forbidden_development` |
| `reviewer` | May be overridden by a user with role ≥ editor with a recorded reason; the override is stored on the issue and fed to calibration | all other `major` issues: unlocked-fact contradictions with narrated change, register/voice, structure/prose drift, repetition, payoff-without-setup, length, numeric inconsistency, unapproved terms |
| `advisory` | Auto-dismissed unless the policy escalates them | `minor`, `note` |

Rules:
1. Severity may be *raised* by policy per project (e.g., a project treats `register_error` toward royalty
   as `canon_workflow`), never lowered below the table.
2. A `reviewer` override on a **fact-bearing** issue (anything with `conflicting_canon`) automatically
   opens a *correction proposal* so the reviewer decides whether the canon or the text is right; the
   override is recorded but the contradiction is not left unresolved.
3. Override rate per kind is a calibration metric (> 30 % → rubric/threshold review, ADR-0029).
4. Overrides never change the scorecard sections; a dimension that failed stays failed in the record — the
   gate outcome is recorded separately as `approved_with_overrides`.

## Alternatives considered
- Generic override with reason for everything — the failure mode this ADR prevents.
- No overrides — judges are calibrated signals, not laws; subjective style issues need a human path.

## Consequences
`issue.schema.json` gains `override_class`; the policy schema carries the matrix; FR-5.4 and the UI/API
plans reference it; the testing strategy adds override-matrix tests (a `never` issue cannot be approved
by any signal; a locked-fact contradiction requires a correction commit before re-evaluation passes).
