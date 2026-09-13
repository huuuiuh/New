# ADR-0036: MVP re-scoped to a vertical slice with all foundational invariants

- **Status:** Accepted — delivery order re-cut into checkpoints by ADR-0044; gates are per dimension (ADR-0041)
- **Date:** 2026-09-13
- **Deciders:** principal architects (product, software, AI systems, data, Korean webnovel production)

## Context
The first MVP definition was broad (16 genre overlays, Korean tooling, many surfaces). The correction is
an opportunity to make the MVP a realistic, end-to-end slice without postponing the foundations that
cannot be retrofitted.

## Decision
MVP = one workspace, four genre profiles (hunter-gate, regression, academy, romance-fantasy), English
output only, Assisted + Semi-automatic modes, single-chapter and sequential batch production, canon
inspectors, corrections/regeneration with material-dependency reports, TXT/DOCX export. Foundations kept in
MVP: accepted-only canon with atomic commits, evidence-backed bitemporal facts, reality frames, per-timeline
truth, knowledge ledger, context packs with Active Constraint Set, Narrative Identity Guard with both
contracts, output-language check, dimension-separated evaluation, prompt versioning, durable workflows,
patch-first revision, material/contextual dependency edges. Deferred: autopilot, remaining genres,
automated retcon patches, feedback import, EPUB, similarity screening, optional grammar service, Korean UI.

## Consequences
Roadmap Phases 0–4 shortened; backlog trimmed; scope doc §2 defines the slice.
