# ADR-0040: StoryClock ordering, uncertainty and simultaneity

- **Status:** Accepted
- **Date:** 2026-09-13
- **Deciders:** engineering agent (Checkpoint 0 audit)

## Context
`StoryClock` was defined as `(chapter_no, ordinal, world_date?, precision)` with the ordering rule
"(timeline_id, world_date if comparable, chapter_no, ordinal)". That rule is ambiguous: it does not say how
`unknown` precision sorts, what "comparable" means across calendars, whether a flashback (earlier
world_date, later chapter) sorts by when it happened or when it was narrated, how simultaneous events tie,
or how the derived ordering keys `valid_from_ord`/`valid_to_ord` are computed.

## Decision
1. **Two orders, one authoritative.** *Narrative order* `(chapter_no, ordinal)` is total within a timeline
   and is the authoritative sort key for validity, "as of chapter k" queries and pack rendering. *World
   order* (`calendar`, `world_date`, `precision`, `uncertainty_days`) is partial and is used for duration
   and elapsed-time reasoning (travel time, healing windows, "the next morning").
2. **Derived key.** `ord = chapter_no × 1,000,000 + ordinal` (bigint). `ordinal` is bounded to `< 1,000,000`
   and assigned by the extractor from the paragraph order of the anchoring evidence; user corrections may
   renumber within a chapter.
3. **Flashbacks and retellings** carry the clock of *when it happened* (`clock_start`, possibly
   `chapter_no = 0` for pre-story time) plus `narrated_at` (where the manuscript tells it). Facts derived
   from a flashback are valid from the happened-clock. "What has been revealed to the reader by chapter k"
   uses `narrated_at`; "what was true at chapter k" uses `clock_start`.
4. **Precision.** `exact` and `approx` clocks participate in world order; `approx` carries
   `uncertainty_days` and two approx clocks whose windows overlap are *unordered*, not equal. `unknown`
   clocks never participate in world order; a duration check that needs one reports a continuity risk
   (`clock_unknown`) instead of guessing.
5. **Calendars.** `world_date` is comparable only within one `calendar`
   (`gregorian | relative_days | era:<name>`). Cross-calendar comparison is undefined unless the project
   registers an explicit conversion anchor (Beta); until then, cross-calendar checks fall back to narrative
   order and flag `calendar_incomparable`.
6. **Simultaneity.** Equal `(timeline_id, chapter_no, ordinal)` means simultaneous or unordered. Where a
   deterministic total order is required (rendering, dedupe), ties break by item id (UUIDv7, i.e. creation
   order). Simultaneous state changes to the same `(entity, attribute, key)` are a verifier conflict, never
   silently ordered.
7. **Cross-timeline.** A prior-loop or alternate clock is comparable to a main clock only through the
   child timeline's `divergence_clock` (both sides share narrative order before it and are incomparable
   after it). `source_story` timelines have no divergence clock and are never compared with `main`
   (ADR-0039).
8. **Chapter 0.** `chapter_no = 0` is pre-story time (backstory, prior-loop events before the manuscript,
   source-story material); ordinal orders within it.

## Alternatives considered
- Single world-date-first ordering — breaks on unknown/approx dates and different calendars, which are the
  norm in secondary-world fantasy.
- Real timestamps for world dates — forces a calendar the story may not have.

## Consequences
`common.storyClock` gains `calendar` and `uncertainty_days`; `event` gains `narrated_at`; data architecture
documents the derived key; the testing strategy adds StoryClock ordering property tests (flashback,
unknown, approx overlap, cross-calendar, tie-break, cross-timeline).
