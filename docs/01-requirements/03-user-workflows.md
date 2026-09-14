# User Workflows

Each workflow lists: actor, preconditions, steps (UI ↔ system), gates, outputs, failure paths. UI screens
are named per `docs/06-system/08-ui-plan.md`.

## UW-1 Create a story (minimal intake)

**Actor:** author. **Precondition:** workspace exists, budget configured (or default trial budget).

1. `New Project` → enter title (working), premise (free text in any language; **manuscript output is
   English**), pick genre + subgenres from the catalog (`docs/02-narrative-identity/03-genre-catalog.md`),
   target chapters, target words/chapter (default 2,500), spelling locale (default `en-US`), audience/rating,
   operating mode (default Assisted), quality tier (default Standard).
2. Optional "Advanced" accordion: main character, supporting cast, world concept, tropes (multi-select +
   free text), forbidden developments, tone sliders, romance preference, progression system, ending
   preference, mandatory scenes, content restrictions, setting/cultural profile (e.g., modern Seoul vs
   secondary world), naming style (Korean-style romanized / Western-style / invented), terminology
   preference (translate vs romanize Korean-origin terms).
3. System runs `RequirementInterpretationWorkflow`: normalizes to Story Spec v1; classifies each item hard/
   soft/assumption; detects conflicts (FR-1.7) → if conflicts, user resolves inline.
4. **Assumption Review** screen: list of assumptions grouped (genre conventions, cast, world, progression,
   romance, ending, naming, terminology, prose preferences). Each: Confirm / Edit / Reject / Decide later.
   Bulk "Confirm all safe defaults".
5. Output: Story Spec v1 approved. Project state `spec_ready`.

Failure paths: model outage → job `needs_attention` with retry; unresolvable conflict → project stays in
`intake`.

## UW-2 Concept development

1. `Generate concepts` (2 by default, 3 in Premium) → `ConceptWorkflow` produces candidates in parallel,
   then a pairwise comparison (position-swapped) with a recommendation and rationale.
2. **Concept Compare** screen: side-by-side (logline, promise, reader fantasy, conflict, ch.1 hook, ending
   direction, genre-fit notes, risk notes, estimated progression curve). Actions: Select / Merge (pick
   fields from each) / Regenerate with note.
3. Output: selected concept; project state `concept_selected`.

## UW-3 Story bible review and fact locking

1. `Build bible` → `StoryBibleWorkflow` (characters → dialogue-register & voice profiles → world → power
   system → factions → locations → naming registry → terminology policy → narrative identity binding →
   consistency check).
2. **Bible** screens: Characters (with dialogue-register editor: formality/familiarity/deference toward
   counterparts, English address terms and titles, contraction usage, verbal habits), World, Power System
   (ranks table, costs, limits, cadence), Factions, Locations, Naming Registry (display name, native-script
   name, romanization), Terminology Policy (translate / romanize / gloss / preserve per term), Narrative
   Identity (output language + locale, tradition profile, genre overlays, preferences; preview of the compiled
   block per role).
3. Author edits; each field save is a bible version increment. **Lock** toggle per fact → immutable canon.
4. `Approve bible` gate → state `bible_approved`. Canon version 1 is created from locked + approved bible facts
   (source `bible`).

## UW-4 Plan review (blueprint, season, arc)

1. `Plan series` → `SeriesPlanningWorkflow`: blueprint (promise, conflict, protagonist arc, ending, endgame
   requirements), seasons, first 2 arcs outlined, first H chapter contracts.
2. **Plan** screens: Blueprint; Season board; Arc detail (objective, conflict, satisfaction beats, promises opened/
   due, chapters listed); Chapter Contract editor.
3. Author approves blueprint (gate), then arc 1 (gate). Chapter contracts within horizon are approved
   individually in Assisted mode or auto-approved in Semi-auto/Autopilot.
4. Output: state `planning_ready`.

## UW-5 Generate a chapter

1. From Chapter Contract → `Generate`. Pre-flight shows: predicted cost, canon version, mode, tier.
2. `ChapterProductionWorkflow` runs (see `docs/05-generation/01-generation-pipeline.md`). Progress card
   shows current step, spend, scenes drafted, issues so far.
3. Gate (Assisted): **Chapter Review** screen — manuscript (mobile preview), scorecard with separate prose /
   structure / genre / voice / continuity sections, issues with evidence, candidate comparison (if N>1),
   extraction preview (proposed canon delta). Actions: Approve / Request changes (free text → patch tasks) /
   Reject (with reason) / Regenerate.
4. On approve: extraction → reconciliation → verification → canon commit → post-commit. UI shows the
   committed delta.

Failure paths: revision rounds exhausted → `needs_attention` with residual issues; budget exhausted →
paused with resume option; stale canon (another commit intervened) → re-validate contract; if still
valid, continue; else re-plan.

## UW-6 Generate a chapter batch

1. Select range k..k+n; choose gate policy for the batch (per mode); see cost prediction and hard-limit
   headroom.
2. `BatchProductionWorkflow` runs chapters sequentially as child workflows. In Semi-auto mode: chapters
   with no blocking/major issues and every gated dimension at or above its threshold are auto-approved (then accepted by the commit); others queue for review and the batch
   pauses (configurable: pause vs. continue with review queue — default pause because later chapters
   depend on acceptance).
3. Author reviews the queue; batch resumes.

## UW-7 Add directions during generation

1. `Directions` panel: enter text (any language; stored with language code and English working paraphrase);
   system classifies (hard/soft), scope (from chapter k / arc / character / series), and shows how it affects
   plans (re-plan preview: which contracts become stale).
2. Confirm → Story Spec version increments; horizon re-planning runs; batch in progress applies from the
   next un-drafted chapter.

## UW-8 Correct canon

1. **Canon Inspector** → any fact/event/knowledge/relationship item → `Correct`. Edit value/validity/
   stance; give reason.
2. System shows impact report: **materially** dependent chapters/plans (via dependency edges), contextual
   dependents as "review suggested", affected promises, summaries to regenerate.
3. Confirm → canon commit (source `user_correction`) → dependents marked stale → optional patch tasks.

## UW-9 Request a retcon

1. From an accepted chapter → `Retcon`. Author edits text (or describes change → system proposes a patch).
2. New manuscript version → re-extraction diff vs. current canon → author reviews delta → commit →
   dependency propagation (later chapters stale with reasons; Beta: patch proposals generated
   automatically).

## UW-10 Regenerate a chapter

1. From chapter → `Regenerate` with optional directions. Dependency report shown: later accepted chapters
   that materially depend on canon from this chapter (contextual dependents listed separately); author
   chooses: regenerate only (later chapters stale, review later) or cascade (queue later chapters for
   re-validation).
2. Runs `ChapterProductionWorkflow` with `supersedes=chapter_version_id`; old version kept (non-canonical
   after commit of the new one; canon items from the old version are retracted in the same commit).

## UW-11 Compare candidates

1. When N>1 candidates: **Compare** view with side-by-side text, per-candidate scorecards, the judge's
   pairwise verdicts (both orders) and rationale; author picks or lets the recommendation stand.
2. The unpicked candidates go to quarantine (viewable, never used).

## UW-12 Review continuity warnings and quality scores

**Chapter Review** and **Project Health** screens: issues grouped by severity/kind; each issue → chapter span
highlight + canon item + canon evidence (quote from earlier accepted chapter, deep link). Filters by
kind (knowledge leak, timeline, injury, inventory, rank, translation-like English, Western-novel drift,
weak hook/payoff, register drift, voice drift, repetition…).

## UW-13 Inspect story state

- **Timeline**: story clock with events; filter by frame (canonical, flashback, dream, lie…); alternate
  timelines as lanes.
- **Character**: current state (location, injuries, inventory, rank, resources), state history, arc
  progress, dialogue-register profile, voice exemplars.
- **Knowledge matrix**: propositions × knowers with stance icons; "as of chapter k" slider.
- **Relationships**: graph + directed pair detail (type, trust, address terms/titles, register summary,
  history).
- **Promises**: open/overdue/paid; due windows; linked setups/payoffs.

## UW-14 Review costs

Project cost page: spend by role/model/chapter, cost per accepted chapter, per 1,000 accepted words,
budget headroom, predictions for remaining chapters, hard limit status.

## UW-15 Pause / cancel / resume

Jobs page: running/paused/failed/needs_attention. Pause = checkpoint after current activity; Cancel =
cooperative cancel, partial artifacts kept as non-canonical; Resume = continue from checkpoint (stale check
first).

## UW-16 Export

Export page: choose scope (volume/season/series/chapter range), format (TXT/DOCX; EPUB Beta), options
(chapter header format, glossary of romanized terms, AI disclosure text, rights statement, spelling
locale confirmation). Export job produces a file in object storage with a signed URL; export recorded in
audit log.

## UW-17 Approve final chapters (review queue)

Review queue lists chapters awaiting approval with score, issue counts, spend, age. Keyboard-driven review.
Approving triggers canon extraction; rejecting requires reason and returns to revision or regeneration.
