# ADR-0041: One versioned Production Policy for limits, thresholds and gates

- **Status:** Accepted
- **Date:** 2026-09-13
- **Deciders:** engineering agent (Checkpoint 0 audit)

## Context
Operational numbers were duplicated across documents and disagreed: revision-round limits were
"Standard 3 / Economy 2 / Premium 4" in the evaluation pipeline but "2 (Standard), 3 (Premium)" in the
drift-repair doc; the executive summary gated Semi-automatic chapters on "scorecard ≥ tier threshold" while
the acceptance criteria required separate prose/structure gates; an `early_stop_threshold` of 88/100 was
an aggregate score; verbatim-tail length appeared as 400 words, 350–500 words and 250 words; per-tier
score gates lived only in prose. ADR-0029 already says style thresholds are configuration; this ADR extends
the principle to workflow limits and gate policy and gives them one home.

## Decision
1. A **Production Policy** is a versioned data object (`schemas/production-policy.schema.json`) with one
   shipped starting version per quality tier (`examples/production-policies/standard.v1.json`, `economy`,
   `premium`). It is the only place that defines:
   - revision limits (`max_revision_rounds`, `max_patches_per_round`, `max_scene_rewrites`,
     `per_span_attempts`);
   - candidate policy (`candidate_count`, `early_stop`);
   - per-dimension gate thresholds (`prose`, `structure`, `genre`, `voice` scores; blocking/major counts;
     regression tolerance per dimension);
   - the previous-chapter tail budget (`tail_words`, degradation floor);
   - extraction thresholds (`single_source_min_confidence`, fuzzy anchoring ratio, adjudication rule);
   - output-language threshold; length tolerance ratios;
   - the issue-override matrix (ADR-0042) by reference.
2. Documents **reference** policy keys (`policy.revision.max_rounds`) and may quote the Standard starting
   value with the marker "(starting value, `standard.v1`)". A document that states a bare number for a
   policy-owned parameter is a validator error.
3. **Gates are per dimension.** A version is *auto-approvable* only when every deterministic criterion
   passes, `blocking_count = 0`, `major_count = 0`, and each of `prose`, `structure`, `genre`, `voice`
   meets its own threshold. `scorecard.overall.score` is informational and is never a gate input.
   `early_stop` is likewise per dimension: stop generating candidates only when a candidate already
   auto-approvable exceeds every dimension's threshold by the configured margin.
4. Every job pins `production_policy_version` at start (alongside the prompt set); changing a threshold
   creates a new policy version and records calibration status (ADR-0029).

## Alternatives considered
- Keep numbers in profiles only — profiles are per narrative identity; revision limits and budgets are
  per tier/project and independent of genre.
- Keep numbers in code constants — violates ADR-0029 and makes calibration a deploy.

## Consequences
New schema + three examples; evaluation pipeline §4.2/§5, drift-repair §2/§5, executive definition,
user workflows, cost plan, chapter-contract spec §8, context-pack assembly §2.4/§4 and FR-4.3 now reference
the policy; `job` and `llm-call-record` carry `production_policy_version`; validator scans for bare
policy numbers.
