# ADR-0019: Assisted mode as default; Semi-automatic after first arc; Autopilot in Beta

- **Status:** Accepted
- **Date:** 2026-09-13
- **Deciders:** principal architects (product, software, AI systems, data, Korean webnovel production)

## Context
Trust in auto-approval must be earned; early bible/plan mistakes are the most expensive.

## Decision
Default **Assisted** (human approves assumptions, bible, blueprint, arc 1, and each chapter of arc 1),
then recommend **Semi-automatic** (policy approves clean chapters that pass every per-dimension gate — ADR-0041; queue others). **Autopilot**
ships in Beta with hard budgets and escalation rules.

## Alternatives considered
- Autopilot first — high risk of committing flawed canon at scale.

## Consequences
Gate policy abstraction in workflows from day one.
