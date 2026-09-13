# ADR-0003: Temporal for durable, resumable workflows

- **Status:** Accepted — staged: the MVP core loop runs on Postgres-checkpointed idempotent steps first; Temporal is introduced when the loop is proven (ADR-0044)
- **Date:** 2026-09-13
- **Deciders:** principal architects (product, software, AI systems, data, Korean webnovel production)

## Context
Chapter production is a long multi-step process with human gates, retries, cancellation, budgets and
crash recovery. Requirements demand resumability, idempotency and exactly-once canon commits.

## Decision
Orchestrate with **Temporal** (TypeScript SDK). Workflows are deterministic; all I/O in activities with
idempotency keys; human gates are signals; batches are parent workflows with sequential children.

## Alternatives considered
- Custom queue + state machine in Postgres — reinvents retries, timers, signals, history.
- BullMQ/Celery — job queues without durable multi-step orchestration semantics.

## Consequences
Operational dependency on Temporal (Cloud or self-hosted); deterministic workflow code discipline; audit
remains in Postgres (Temporal history is not the audit log).
