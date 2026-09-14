# ADR-0039: `source_story` is a fact-bearing timeline reached only through knowledge

- **Status:** Accepted
- **Date:** 2026-09-13
- **Deciders:** engineering agent (Checkpoint 0 audit)

## Context
Possession, villainess and transmigration stories give the protagonist knowledge of an "original story"
(the novel or game they were transported into). The package disagreed about what that knowledge *is*:
`common.realityFrame` and `fact.frame` listed `source_story` as fact-bearing; ADR-0007 and the
canon/temporal doc §1.6 omitted it from the fact-bearing list; the genre catalog called it a frame in one
place and a knowledge source in another; `timelines.kind` had no `source_story` value; the catalog also
used an undefined `prior_life` frame.

The two candidate models:
- **Knowledge-only**: "in the original story the duke dies at the hunt" is stored solely as a knowledge
  stance of the possessor, with the content in free text. Simple, but it cannot answer "did the original
  story's duke die at the hunt?" as a query, cannot detect divergence ("the duke lived — the story has
  changed") and cannot keep the original-story timeline internally consistent across hundreds of chapters.
- **Fact-bearing timeline**: the original story is a timeline like a prior loop; its facts and events are
  extracted from what the manuscript states about it; the main timeline learns of them only via knowledge
  stances of the possessor. This is exactly the machinery regression already needs (ADR-0023, ADR-0031).

## Decision
1. `source_story` is a **timeline kind** (`timelines.kind ∈ main | prior_loop | alternate | source_story`,
   schema `common.timelineKind`) and a **fact-bearing reality frame** on that timeline. Events narrated as
   "in the original story…" produce facts and events on the `source_story` timeline with frame
   `source_story`; per-timeline proposition truth (ADR-0031) records what was true there.
2. On the **main** timeline nothing changes except knowledge: the possessor gets `knows` stances with
   `source.kind = source_story`; `diverged` is computed exactly as for regression by comparing main-timeline
   truth with source-story truth at the current story clock.
3. The `source_story` timeline has **no divergence clock** (it is not a branch of `main`; it is a parallel
   reference). Its story clocks use `chapter_no = 0` unless the source story's own internal order is
   narrated, in which case `calendar = "era:source_story"` orders them.
4. `prior_life` (reincarnation) is **not** a separate frame: previous-life expertise is `prior_loop`
   timeline material (one prior life = one prior loop with divergence at rebirth), and the genre catalog is
   corrected accordingly.
5. The verifier's fact-bearing frame rule becomes: `canonical`, `flashback` (current timeline);
   `prior_loop`, `alternate_timeline`, `source_story` (each only on a timeline of the matching kind). A
   fact whose frame does not match its timeline's kind is a `FRAME_VIOLATION`.

## Alternatives considered
- Knowledge-only (above) — loses queryability and divergence detection for a whole genre family.
- A `source_story` overlay that re-labels `prior_loop` — the two differ in that a prior loop branches from
  `main` at a divergence clock while a source story never shared a past with `main`; conflating them breaks
  truth inheritance (ADR-0031).

## Consequences
ADR-0007 amended by note; canon/temporal doc §1.6/§1.7 and the genre catalog corrected; `common`,
`fact` and `event` schemas aligned; fixture gains a possession micro-fixture (`examples/fixture/
source-story.micro.json`) exercising a source-story fact, a `knows` stance and a divergence; testing
strategy adds the reality-frame × timeline-kind matrix test.
