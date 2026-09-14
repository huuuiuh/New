# ADR-0038: Five bitemporal change classes — transition, correction, retcon, rollback, retraction

- **Status:** Accepted
- **Date:** 2026-09-13
- **Deciders:** engineering agent (Checkpoint 0 audit)

## Context
ADR-0006 gives facts two time axes (story-time validity, canon-version assertion) but the package did not
name the distinct operations that move them, and the canon-delta `op` enum offered `supersede`/`retract`
without saying which is legal for which situation. Without that, an implementer could record "the injury
healed in chapter 18" by retracting the injury fact — erasing the historical truth that the character was
injured from chapter 10 to 18 — or could "supersede" an extraction error, leaving a false fact visible in
"as of chapter k" queries.

## Decision
Every change to a canon row belongs to exactly one class, recorded on the commit (`canon_commits.source`)
and constrained per class:

| Class | Trigger | Story time (`valid_from/valid_to`) | System time (`asserted/retracted_at_version`) | Commit source | Delta ops allowed |
| --- | --- | --- | --- | --- | --- |
| **Transition** | The story moves on (injury heals, rank rises, location changes, register milestone) | New row asserted at the new clock; prior row's `valid_to` closed at that clock and `superseded_by` linked; the prior row **stays asserted** | untouched on the prior row | `chapter_acceptance` | `assert`, `close`, `supersede`, promise ops |
| **Correction** | The row never should have existed or has a wrong value (extraction error, user fixes a fact) | new row (if any) carries the *originally intended* validity | wrong row `retracted_at_version = v`; replacement `asserted_at_version = v` | `user_correction` (justification required) or `chapter_acceptance` when the verifier rejects a reconciled item before commit | `retract`, `assert` |
| **Retcon** | The *manuscript* is changed after acceptance and re-accepted | rows sourced from the old version are retracted; new rows extracted from the retcon version with their own validity | old rows `retracted_at_version = v`; old version `retconned` | `retcon` | `retract`, `assert`, `close`, `supersede` |
| **Rollback** | Undo the latest commit | `inverse` re-opens any `valid_to` the commit closed, restores rows it retracted, and retracts rows it inserted | inserted rows `retracted_at_version = v`; restored rows keep their original `asserted_at_version` | `rollback` | inverse ops only |
| **System-time retraction** | A row is removed for a reason outside the story (rights, safety, duplicate entity merge) | untouched | `retracted_at_version = v` | `merge_entities`, `regeneration`, `user_correction` | `retract` |

Rules:
1. `close` and `supersede` never set `retracted_at_version`; `retract` never changes `valid_to`.
2. A transition is the **only** class extraction may emit for an in-story change. The verifier rejects a
   `retract` item in a `chapter_acceptance` delta unless it is the reconciliation-stage rejection of the
   delta's own item (stage-local, never applied to canon).
3. The example "injured in chapter 10, healed in chapter 18" is recorded as: `status.injury` row
   `valid_from = ch.10`, `valid_to = ch.18`, `superseded_by → status.condition healed/scarred row`, both rows
   asserted (the injury row at the ch.10 commit, the closure and the new row at the ch.18 commit). "As of
   chapter 14" still returns the injury; "as of canon version at ch.9" returns nothing.
4. `inverse` on every commit is complete: it lists, per touched row, the exact prior values of `valid_to`,
   `superseded_by`, `retracted_at_version`, so a rollback restores them without inference.
5. Rollback of a chapter acceptance returns the manuscript version to `approved` (not `accepted`) and the
   chapter to `approved`; the canon version is bumped once (`source=rollback`), never decremented.

## Alternatives considered
- Physically delete rows on rollback — loses the audit trail and breaks "as of version v" queries.
- Treat healing as retraction — erases history; rejected (this is the bug the ADR exists to prevent).

## Consequences
Canon-delta schema gains `close`, documents `retract` as non-transition; testing strategy gains one test
per class; canon/temporal doc §9 rewritten around this table; fixture ch.14 (venom cleared) becomes the
transition test and R1 (right leg → left leg) the retcon test.
