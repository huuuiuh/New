# ADR-0006: Bitemporal facts with mandatory evidence spans

- **Status:** Accepted — change classes (transition / correction / retcon / rollback / retraction) defined by ADR-0038
- **Date:** 2026-09-13
- **Deciders:** principal architects (product, software, AI systems, data, Korean webnovel production)

## Context
Story state changes over story time (injury heals, rank rises) and canon itself changes over system time
(corrections, retcons, rollbacks). Facts must be traceable to accepted text.

## Decision
Facts carry `valid_from/valid_to` (story clock) and `asserted_at_version/retracted_at_version` (canon
version). Facts are never deleted; supersession closes validity, retraction closes assertion. Every
extracted fact links ≥ 1 verified evidence span into an immutable accepted manuscript version; bible facts
are `source=bible`.

## Alternatives considered
- Current-state-only tables — cannot answer "at chapter 40" or "before the retcon".
- Free-text memory — not queryable, not verifiable.

## Consequences
More rows and careful queries (helper SQL functions); complete auditability and time travel.
