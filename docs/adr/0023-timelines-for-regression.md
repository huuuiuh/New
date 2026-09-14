# ADR-0023: Explicit timelines for regression/possession/alternate realities

- **Status:** Accepted — `source_story` is a timeline kind with its own facts (ADR-0039)
- **Date:** 2026-09-13
- **Deciders:** principal architects (product, software, AI systems, data, Korean webnovel production)

## Context
Regression stories carry a "known future" that must never be mistaken for current canon, and "original
story" knowledge in possession/villainess works behaves the same way.

## Decision
Model **timelines** (`main`, `prior_loop_n`, `alternate_*`) with divergence points; prior-loop facts live on
their timeline (frame `prior_loop`/`source_story`) and reach the present only as **knowledge** of the
regressor/possessor; `diverged` flags are computed when `main` contradicts prior-loop facts and surfaced to
the writer as a "what has changed since the first life" list. Default one prior loop; multiple loops supported by new timelines.

## Consequences
Extractor guidance per overlay; UI timeline lanes; fixture traps T8/T15.
