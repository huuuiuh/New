# ADR-0044: Modular monolith first; Temporal and the web app are introduced when the core loop is proven

- **Status:** Accepted
- **Date:** 2026-09-13
- **Deciders:** engineering agent (Checkpoint 0 audit)
- **Amends:** ADR-0003 (Temporal), ADR-0021 (repository structure), ADR-0036 (MVP vertical slice)

## Context
ADR-0003/0021 prescribe Temporal workers, a Fastify API and a Next.js app from Phase 0. The first thing
that must be proven is the *story loop*: intake → spec → bible → arc → contract → pack → English chapter →
separate prose/structure evaluation → revision → approval → extraction → verified atomic commit →
chapter 2 that remembers chapter 1 → export. None of that requires a workflow engine or a browser UI, and
standing them up first would delay the proof and multiply the surfaces that can be wrong.

## Decision
1. **Package boundaries stay as planned** (`packages/domain, db, gateway, prompts, narrative, prose,
   context, canon, eval, workflows`) so nothing has to be re-cut later; they are TypeScript packages in one
   pnpm workspace and are exercised first through a **CLI** (`apps/cli`) against a local Postgres.
2. **Durable workflow engine deferred.** `packages/workflows` implements the chapter-production state
   machine as *idempotent steps with persisted checkpoints in Postgres* (`jobs`, `job_steps`, idempotency
   keys). The step contract is designed so each step can later become a Temporal activity without
   changing its inputs/outputs; ADR-0003 remains the target for Beta scale, not the MVP prerequisite.
3. **API and web UI deferred to Checkpoint 7.** The CLI and JSON artifacts are the review surface until the
   core loop passes the fixture end to end (Checkpoint 5). The API plan (`06-system/03`) and UI plan
   (`06-system/08`) are unchanged as designs.
4. **Invariants are not deferred**: English output enforcement, Narrative Identity Guard, versioned
   prompts, immutable manuscript versions, planned-vs-canonical separation, quarantine, evidence-backed
   canon, knowledge ledger, temporal state, deterministic packs, atomic commits, idempotent steps and
   budget accounting are all in Checkpoints 1–5.
5. **Postgres remains the single system of record** (ADR-0002); a local instance is the only
   infrastructure dependency of the MVP. pgvector is optional until vector retrieval is needed (structured
   + lexical retrieval first, per the brief).

## Alternatives considered
- Build the full topology first — highest risk of proving nothing for weeks.
- Skip the package boundaries and write one flat app — cheap now, expensive at Checkpoint 7.

## Consequences
Roadmap Phase 0–2 re-cut into Checkpoints 1–6; backlog items for Temporal bootstrap, API skeleton and UI
move to Checkpoint 7; ADR-0021's app list gains `apps/cli`; `06-system/01` notes the staged topology.
