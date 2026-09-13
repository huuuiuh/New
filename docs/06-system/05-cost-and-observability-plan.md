# Cost and Observability Plan

## 1. Budget model (ADR-0018)

| Scope | Limits | Enforcement |
| --- | --- | --- |
| Workspace | monthly hard limit (optional) | pre-call check in gateway |
| Project | total hard limit; soft warning at 80% | pre-call; batch pre-flight |
| Chapter (job) | per-chapter hard limit (default by tier: Economy ×1.5 of predicted, Standard ×2, Premium ×2.5) | pre-call |
| Workflow step | max attempts, max candidates, max revision rounds | workflow logic |

Pre-call check: `remaining = min(limits) − spent − reserved_in_flight`; predicted cost of the call
(input tokens × price + max_tokens × price) must be ≤ remaining, else the workflow pauses at the activity
boundary with `paused_budget`. Reservations are released on completion with the actual cost.

## 2. Model routing by function (cost tiers)

| Function | Class | Rationale |
| --- | --- | --- |
| English prose under Korean-webnovel constraints (scene_writer, revisers, rewriter, line editor) | P | quality-critical; benchmark-selected (natural English + serialized structure) |
| Series/arc planning, continuity checking, adjudication, comparisons | R | reasoning-heavy, low volume |
| Contracts, scene plans, assembler, extractors, prose judge, structure judge, knowledge checker | M | structured output, moderate reasoning |
| Classification, summaries, promise/repetition/voice/pacing checks, JSON repair | C | high volume, low complexity |
| Embeddings | E | |

Quality tiers change **counts**, not correctness, and each tier is a Production Policy version
(ADR-0041; `examples/production-policies/{economy,standard,premium}.v1.json`): Economy (single extractor +
deterministic cross-check; genre judge folded into structure judge and voice judge into prose judge — prose
and structure stay separate; no candidates), Standard (as pipeline §4.1), Premium (N=2 candidates; two
judge families; line editor pass). Revision limits are `policy.revision.*`.

## 3. Reference cost model (Standard, ~2,500-word chapter)

Token estimates (English ≈ 1.3 tokens/word for common tokenizers; calibrated per model):

| Step | Calls | Input tok (approx) | Output tok | Notes |
| --- | --- | --- | --- | --- |
| scene_planner | 1 | 9k | 2k | |
| scene_writer ×3 | 3 | 20k each (≈ 12k cached prefix) | 2.2k each | prose model |
| chapter_assembler | 1 | 12k | 1k | |
| continuity_checker | 1 | 18k | 2.5k | R model |
| knowledge_leak_checker | 1 | 12k | 1.5k | |
| contract_compliance | 1 | 10k | 1.5k | |
| prose_judge | 1 | 10k | 2k | other family |
| structure_judge | 1 | 10k | 2k | other family |
| genre/voice/promise/repetition | 4 | 6–9k each | 1k each | cheap |
| revision (1 round, 3 patches) | 3 + 2 rechecks | 5k / 10k | 0.8k / 1k | |
| extractors ×2 | 2 | 15k each | 4k each | |
| adjudicator (30% of chapters) | 0.3 | 5k | 1k | |
| summarizer_l1 | 1 | 9k | 0.4k | |
| **Totals** | ≈ 21 | ≈ 240k input (≈ 40% cache-eligible) | ≈ 30k output | |

Cost is computed at runtime from the routing table's per-model prices; the plan does not hardcode prices.
The dashboard reports **cost per accepted chapter** and **per 1,000 accepted words**; the
prediction model uses the project's own rolling averages per step after 5 chapters (before that, tier
defaults).

## 4. Cost controls

- **Context caching**: stable sections first (narrative identity block, active constraint set, bible slice, L4) → provider prefix caching;
  section cache by hash avoids re-rendering.
- **Deduplication**: identical packs (hash) within a job reuse rendered text; identical evaluator inputs
  across candidates share cached sections.
- **Early stopping**: candidate generation stops when the first candidate meets the early-stop threshold;
  revision stops when no blocking/major remain; evaluators skip when deterministic checks already fail hard
  (e.g., truncation → fix before judging).
- **Right-sizing**: cheap models for classification/summaries; judges on different but not necessarily
  larger models; `continuity_checker` on R only when the chapter has ≥ 1 continuity risk flagged or every
  Nth chapter (Economy) — Standard always runs it.
- **Retry limits**: per failure class (reliability plan).
- **Cost prediction** before batches; **hard stop** at limits; **soft alerts** at 50/80/95%.
- **Quality tiers** selectable per project and per chapter (e.g., Premium for climaxes).

## 5. Observability

### 5.1 Tracing
OpenTelemetry spans: `workflow.run` → `activity` → `gateway.call` → `provider.request`; attributes: role,
prompt_version, model, provider, pack_id, canon_version, tokens, cost, schema_valid, finish_reason,
attempt. Trace IDs stored on `llm_calls` and `jobs`.

### 5.2 Metrics (Prometheus-style)
- `llm_calls_total{role,model,provider,status}`, `llm_tokens_total{role,model,kind}`, `llm_cost_cents_total{...}`
- `llm_latency_seconds{role,model}` histogram; `provider_error_rate`, `fallback_total`, `schema_invalid_total`
- `chapter_revision_rounds` histogram; `issues_total{kind,severity}`; `override_total{kind}`
- `prose_score` and `structure_score` histograms per project (separate); `genre_score`; `voice_score`;
  `prose_translation_marker_rate`; `structure_hook_sentence_index`; `register_violation_rate`;
  `output_language_failures_total`
- `extraction_disagreement_rate`; `evidence_verification_failures`; `canon_commit_duration`
- `pack_assembly_duration`, `pack_t2_items`, `pack_degraded_total`
- `jobs_by_status`, `needs_attention_total`, `stale_artifacts_total`
- `budget_utilization_ratio{scope}`

### 5.3 Logs
Structured JSON; no manuscript/prompt text (IDs + hashes only); correlation by trace ID.

### 5.4 Dashboards
Pipeline health · Provider health · Cost (per project/model/role; per accepted chapter) · Quality trends
(prose/structure/genre/voice scores, drift-class rates, issue kinds, override rates) · Canon health (disagreement rate, stale counts, commit
latency).

### 5.5 Alerts (Beta+)
Provider error rate > 10% (5 min); schema invalid rate > 5%; needs_attention > threshold; budget 95%;
extraction disagreement > 25%; prose or structure median < 70 for a project (quality regression); any
output-language failure.
