# Context and Memory Architecture

## 1. Principles

1. **The application is the memory.** Canon lives in Postgres as typed, versioned, evidence-linked records.
   The model receives a constructed **Context Pack** and returns proposals; nothing it says is remembered
   unless extracted from an accepted chapter and committed.
2. **Hybrid memory, not one trick.** Structured canon (facts/events/knowledge/relationships/promises),
   immutable manuscript text with span addressing, hierarchical summaries, lexical + vector indexes, and a
   dependency graph — each used for what it is good at.
3. **Separation of concerns by table and by frame.** Requirements ≠ assumptions ≠ canon ≠ plans ≠ drafts ≠
   rejected drafts ≠ feedback. Cross-contamination is prevented by schema (different tables), by
   `reality_frame` on narrative content, and by the assembler's allowed-sources list.
4. **Bitemporal truth.** Every fact has a story-time validity interval and a system-time assertion
   interval. "What was true at chapter 40?" and "What did canon say at version 300?" are both answerable.
5. **Evidence or it did not happen.** Important canon carries spans into accepted manuscript versions.
6. **Deterministic assembly.** Context packs are pure functions of (contract, canon version, profile
   version, template version, budget); they are manifested, hashed, cached, and auditable.

## 2. Memory layers

| Layer | Contents | Storage | Used for |
| --- | --- | --- | --- |
| **L-Req** Requirements | Story Spec (hard/soft/assumptions), directions | `story_spec_versions`, `requirements`, `directions` | T0 of every pack |
| **L-Bible** | Characters, dialogue-register & voice profiles, world rules, power system, factions, locations, naming registry, terminology policy | `entities`, `entity_versions`, `terminology_terms`, `register_profiles` | T0 (locked) / T1 |
| **L-Canon-Facts** | Bitemporal facts about entities (attributes, relations, states) | `facts` (+`evidence_spans`) | T1 (participants), T2 (retrieved) |
| **L-Canon-Events** | Canonical events with story clock, participants, frames | `events`, `event_participants` | T1 recent / T2 retrieved |
| **L-Knowledge** | Propositions × knowers × stance × validity | `propositions`, `knowledge_states` | T1 (participants × contract propositions) |
| **L-Relationships** | Directed pair states with history | `relationship_states` | T1 |
| **L-Promises** | Promise ledger | `promises`, `promise_events` | T1 (due/active) |
| **L-Text** | Immutable manuscript versions | `manuscript_versions` (+ object storage for large text) | T1 (previous chapter tail), evidence |
| **L-Summaries** | L1 chapter, L2 arc, L3 season, L4 series | `summaries` | T1 (L1 recent), T2 (L2/L3), T0 (L4 compact) |
| **L-Index** | Lexical (English full-text `tsvector` with stemming; registry names/terms as exact tokens) + vector (pgvector, versioned per embedding model) over summaries/events/evidence | `search_documents`, `embeddings` | T2 retrieval |
| **L-Graph** | Entity↔event↔proposition↔promise↔chapter edges; dependency edges with materiality class | `edges`, `dependency_edges` | Retrieval hops; stale detection (material edges only) |
| **L-Plans** | Blueprint, seasons, arcs, contracts, scenes | `plan_*` | T0 (contract), T1 (arc), frame=plan |
| **L-Quarantine** | Rejected drafts/candidates, non-accepted versions, raw feedback | `quarantine_*` | never in packs (audit/learning only) |

## 3. What happens on acceptance (memory update path)

```
accepted manuscript version V (chapter k)
  ├─ Extractor A (model X, prompt ex_a@v) ──┐
  ├─ Extractor B (model Y, prompt ex_b@v) ──┼─► Reconciler (deterministic match + adjudicator call on conflicts)
  └─ Deterministic pre-pass (registry NER, status-window numbers, speaker/register annotations) ─┘
                        │
                        ▼
              Evidence Verifier (quotes must match V[start:end]; entity IDs resolve; frames valid;
                                 no `plan`/`prediction` frame item may mutate state)
                        │
                        ▼
              Canon Delta (facts±, events, knowledge±, relationships±, promises±, questions, L1 summary)
                        │
                        ▼
              ATOMIC COMMIT (single tx): apply delta, retract superseded facts (system time),
                                          bump canon_version, write delta+inverse, write dependency edges,
                                          write summary L1, enqueue L2–L4 refresh, index docs
                        │
                        ▼
              Post-commit: embeddings, exemplar candidates, promise status, horizon re-plan, stale marking
```

Details: `02-canon-and-temporal-state.md`, `03-character-knowledge-architecture.md`.

## 4. Context Pack (memory read path)

Every LLM call gets a pack built by `packages/context` from a **pack template** for its role. Full
specification in `04-context-pack-assembly.md`. Summary of the chapter-writer pack:

| Tier | Contents | Budget policy |
| --- | --- | --- |
| **T0 Mandatory** | **Active Constraint Set** (scope-filtered hard requirements & content restrictions, compiled; ADR-0033), **Narrative Identity Block** (writer_full; contains the English Output-Language Contract and the Korean-webnovel Narrative-Tradition Contract) + IDENTITY_TAIL, Chapter Contract (full), locked facts touching participants, knowledge guards, naming/terminology registry slice for participants/locations/terms in contract, L4 series summary (≤ 200 tokens) | Never trimmed; if over budget → error |
| **T1 Critical** | Previous accepted chapter: last ~400 words verbatim + its L1 summary + its ending hook; participant current states (as of story_time.start) with evidence quotes for risky states (injury/inventory/rank); knowledge states of participants for contract propositions + secrets they must not know; relationship states among participants incl. **dialogue register & address terms (English)**; arc plan (current) + minor arc beats; active promises due within window; timeline position (story clock, elapsed since last chapter); location facts | Compress via approved compressors (state tables, not prose); never drop |
| **T2 Relevant** | Retrieved older events/facts/evidence ranked by relevance to contract (entities, propositions, promises, locations, keywords); L2 summaries of prior arcs touching participants; L3 season summary; prior utterance exemplars for voice (per participant ≤ 3). Items here create **contextual** dependency edges unless the writer's `claims` show they were relied upon (ADR-0032) | Ranked; truncated to budget |
| **T3 Optional** | Style exemplars beyond the block's own, minor entities, world flavor | Dropped first |

## 5. Answering the hard questions (index)

| Question | Mechanism | Doc |
| --- | --- | --- |
| Remember previous chapter exactly | T1 verbatim tail (immutable version) + L1 summary + ending hook + state deltas committed from it | `04-context-pack-assembly.md` §4 |
| Recover event from hundreds of chapters ago | Structured queries (entity/time), lexical+vector retrieval over events/evidence/summaries, graph hops from contract entities/promises; evidence spans pulled verbatim | `05-retrieval-and-indexing.md` |
| Know what each character knows | Knowledge ledger (proposition × knower × stance × validity × source) | `03-character-knowledge-architecture.md` |
| Truth vs belief vs suspicion vs lie vs secret | Stances + `lie` frame events + secrets with knower sets; objective truth = facts; narrator/reader as knowers | same |
| Future plans vs completed events | Plans in `plan_*` tables (frame=plan); events only from accepted text; assembler labels plan items "PLANNED" | `02-canon-and-temporal-state.md` §3 |
| Rejected drafts never enter canon | Extraction reads only the approval-locked (`approved`) version; only `accepted` versions feed packs, summaries, indexes and exemplars; quarantine tables excluded by assembler allowlist; tests | `02-…` §7 |
| Approved chapter updates memory | Extraction → reconciliation → verification → atomic commit | `02-…` §5 |
| Conflicting extractions | Deterministic match → adjudicator with spans → human queue | `02-…` §5.3 |
| Earlier chapter changes propagate | Dependency edges (artifact → canon items @ version, material vs contextual) → stale marking on material edges → patch tasks | `02-…` §8 |
