# ADR-0021: Repository structure for the implementation

- **Status:** Accepted — amended by ADR-0044: `apps/cli` is the first app; `apps/api`, `apps/web`, `apps/worker` follow the core-loop proof
- **Date:** 2026-09-13
- **Deciders:** principal architects (product, software, AI systems, data, Korean webnovel production)

## Context
The implementation agent needs a fixed layout to avoid redesign.

## Decision
```
apps/web, apps/api, apps/worker
packages/domain (types from schemas, invariants), packages/db (migrations, queries, RLS),
packages/gateway, packages/prompts (families/<role>/vX.Y.Z), packages/narrative, packages/prose,
packages/context, packages/canon, packages/eval, packages/workflows
services/grammar-service (optional, English grammar/spelling; ADR-0028)
schemas/ (contracts), examples/ (fixtures), docs/ (this plan)
```
Package boundaries are enforced by lint rules; cross-package calls go through interfaces in `packages/domain`.

## Consequences
Predictable ownership; schema-first workflow.
