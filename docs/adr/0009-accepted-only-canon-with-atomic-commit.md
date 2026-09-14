# ADR-0009: Canon only from approval-locked extraction and accepted-on-commit; two-extractor reconciliation; atomic commit

- **Status:** Accepted (lifecycle wording clarified by ADR-0037: extraction reads the `approved` version; `accepted` is set inside the commit)
- **Date:** 2026-09-13
- **Deciders:** principal architects (product, software, AI systems, data, Korean webnovel production)

## Context
Drafts change; candidates are rejected; extraction can hallucinate. Canon must only reflect the final
accepted text and must never be partially updated.

## Decision
Canon extraction runs only on `approved` versions after the gate; two extractors (different prompts,
ideally different model families) plus a deterministic pre-pass are reconciled; conflicts adjudicated
with spans; evidence verified; the delta is applied by one SQL function in one transaction that bumps the
canon version with an optimistic check and sets the version `accepted`. Rejected drafts move to
quarantine tables invisible to assembler/extractor/exemplar/search.

## Alternatives considered
- Extract from every draft and mark provisional — contamination risk and cost.
- Single extractor — silent misses/hallucinations.

## Consequences
≈ 2–3 extra calls per chapter; strong guarantees; human queue for unresolved majors.
