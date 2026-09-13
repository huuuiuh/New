# ADR-0007: Reality frames on events and derived facts

- **Status:** Accepted (fact-bearing frame list amended by ADR-0039; ordering of frames by ADR-0040)
- **Date:** 2026-09-13
- **Deciders:** principal architects (product, software, AI systems, data, Korean webnovel production)

## Context
Webnovels contain flashbacks, dreams, lies, hypotheticals, predictions, plans, prior-loop memories and
alternate timelines. Treating all narrated content as fact corrupts canon; ignoring it loses knowledge.

## Decision
Every event carries a `frame` from a fixed enum. Only `canonical`, `flashback`, `prior_loop` (own
timeline), `alternate_timeline` (own timeline) and `source_story` (own timeline; ADR-0039) may produce
facts/state changes. `lie` produces knowledge
stances; `dream/hallucination/hypothetical/prediction` produce experiencer knowledge and may open promises;
`plan` exists only in plan tables; `non_canonical_draft` never enters canon.

## Alternatives considered
- Boolean `is_canon` — too coarse for knowledge and promises.

## Consequences
Extractors must classify frames (fixture traps T7/T8/T15 test this); verifier enforces frame rules.
