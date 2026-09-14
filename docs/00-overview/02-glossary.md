# Glossary

Terms are used with exactly these meanings across all documents and schemas. Korean appears only as
**terminology of the narrative tradition** (always glossed) — never as the manuscript language.

## Governing distinction

| Term | Definition |
| --- | --- |
| **Output language (locale)** | The language and spelling locale of reader-facing manuscript text. **English** (`en`, locale `en-US` or `en-GB` per project) is the required output language. Represented by the **Output-Language Profile**. |
| **Narrative tradition** | The body of structural, pacing, gratification and genre conventions the manuscript follows. **Korean serialized webnovel** is the required tradition. Represented by the **Narrative-Tradition Profile**. |
| **Narrative Identity** | The composed, versioned bundle: Output-Language Profile + Narrative-Tradition Profile + Genre Profile(s) + Setting & Cultural Profile + Naming Profile + Dialogue-Register Policy + Terminology & Romanization Policy + User Prose Preferences. Compiled into a **Narrative Identity Block** for LLM calls. |
| **Narrative Identity Guard** | Gateway middleware that rejects any style-sensitive call lacking a valid Output-Language Contract **and** a valid Narrative-Tradition Contract, and records the versions used. |
| **Translation-like English** | English that betrays a source-language template: calqued idioms, dropped articles, Korean word order, transliterated honorifics used as English grammar ("Do-yoon-ssi said"), literal renderings of set phrases. A drift class to detect and repair. |
| **Western-novel drift** | English that follows traditionally published Western novel pacing: slow scene-setting openings, long descriptive paragraphs, literary interiority, chapter ends without forward pull, epic-fantasy exposition. A drift class to detect and repair. |

## Product & workflow

| Term | Definition |
| --- | --- |
| **Workspace** | Tenant boundary. Owns projects, members, budgets, secrets configuration, audit log. All data is isolated per workspace (RLS). |
| **Project** | One novel/series. Owns requirements, story bible, plans, chapters, canon, budgets, narrative identity binding. |
| **Requirement** | A user-provided constraint or wish. Classified as **hard** (must hold; violations block acceptance) or **soft** (preference; weighted in evaluation). |
| **Assumption** | A model- or system-generated decision made to fill a gap in requirements. Stored separately; becomes a requirement only when the user explicitly confirms it. |
| **Story Spec** | The normalized, versioned set of requirements + confirmed assumptions for a project. |
| **Active Constraint Set** | The compiled, scope-filtered, deduplicated rendering of the hard requirements and locked facts that apply to a specific chapter; the T0 representation of requirements (ADR-0033). |
| **Story Bible** | Approved reference for the series: characters, dialogue-register profiles, world rules, power system, factions, locations, naming registry, terminology policy, narrative identity binding. Versioned. |
| **Series Blueprint** | Top-level plan: story promise, reader fantasy, main conflict, protagonist arc, ending, endgame requirements, season list. |
| **Season / Arc / Chapter / Scene** | Planning hierarchy. Season = major narrative movement; Arc (major or minor) = conflict unit spanning chapters; Chapter (episode) = published and acceptance unit; Scene = draft unit. See `docs/03-story-planning/`. |
| **Volume** | Export grouping over accepted chapters (default 25), not a planning level; boundaries are placed near major-arc climaxes. |
| **Chapter Contract** | Structured specification a chapter must satisfy to be accepted (why it exists, must/must-not, participants, knowledge & state deltas, hook, narrative identity version, length target, acceptance criteria). |
| **Planning Horizon** | Number of chapters ahead planned in detail (default 6); arcs ahead planned at outline level (default 2); seasons planned at summary level (all). |
| **Job / Workflow / Activity** | Temporal terms. A *Workflow* is a durable orchestration; an *Activity* is a retriable unit of work; a *Job* is the user-visible record of a workflow run. |
| **Operating mode** | Assisted / Semi-automatic / Autopilot — governs which gates require a human. |
| **Gate** | A point where a workflow waits for human approval (or the policy approves when every per-dimension threshold and issue rule is met; ADR-0041). Gates approve; only the canon commit accepts. |

## Narrative identity components

| Term | Definition |
| --- | --- |
| **Output-Language Profile** | Language code, spelling locale, punctuation conventions (quotes, dashes, ellipses), number/measurement style, register defaults for narration, and the **Output-Language Contract** text (compose directly in natural English; no translation-like syntax). |
| **Narrative-Tradition Profile** | Structural rules of Korean serialized web fiction expressed language-neutrally: hook timing, local payoff, cadence targets (progression, 사이다 beats), exposition control, dialogue-forward scenes, paragraph rhythm for mobile, ending pull, serial devices (status windows, community interludes, hindsight monologue), and the **Narrative-Tradition Contract** text. |
| **Genre Profile (overlay)** | Conventions of a Korean webnovel genre (hunter/gate, regression, academy, murim, romance fantasy, villainess…): reader fantasy, devices, vocabulary registers (in English, with terminology policy), cadence overrides, taboos, rubric notes. |
| **Setting & Cultural Profile** | Where and when the story is set and how culture is rendered: modern Seoul / secondary fantasy world / murim-style historical East Asia; social institutions; measurement and currency; cultural references; how much Korean cultural texture is preserved vs localized. |
| **Naming Profile** | How characters, places and organizations are named and rendered in English: Korean-style names (with romanization system and name order), Western-style names (typical for romance fantasy), invented names; per-entity `display_name` (English manuscript), `native_script_name` (optional, e.g., 강도윤), `romanization`. |
| **Dialogue-Register Policy** | Abstract canonical description of how A speaks to B (formality, deference, familiarity, intimacy, directness, contraction usage, address terms, titles, public vs private register, relationship-driven changes) and the rules for rendering it in **natural English** — replaces direct Korean speech-level enforcement. |
| **Terminology & Romanization Policy** | Per-term decision for Korean-origin concepts: `translate` (use an English term), `romanize` (e.g., *sunbae*), `gloss_first_use` (romanize + explain once), `preserve_script` (keep Korean script — rare, e.g., in-world signage), plus the romanization system (Revised Romanization default) and a fixed English spelling registry. |
| **User Prose Preferences** | Project-level numeric and textual preferences (shorter sentences, less inner monologue, US spelling…) layered last. |
| **Narrative Identity Block** | The compiled, token-budgeted, deterministic rendering of the Narrative Identity for a role; embedded in every style-sensitive call and hashed. |
| **English Prose Lint** | Deterministic checks on English text: grammar/fluency signals, repetitive sentence openings, dialogue-tag overuse, adverb-tag rate, paragraph length, sentence-length rhythm, translation-like syntax markers, spelling-locale consistency, unapproved untranslated terminology, format drift. |
| **Structure Lint** | Deterministic checks of Korean-webnovel form applied to any language: hook position, scene count, local payoff markers, ending type, exposition run length, dialogue ratio band, progression cadence over recent chapters, status-window grammar. |
| **Prose Judge / Structure Judge / Genre Judge / Voice Judge** | Model-based evaluators for, respectively, English prose quality, Korean-webnovel structural adherence, genre-profile adherence, and character voice consistency — always evaluated as separate dimensions. |
| **Drift** | Measurable deviation from the Narrative Identity: *translation-like English*, *Western-novel drift*, *literary drift*, *format drift* (screenplay/script/outline), *register drift* (dialogue register vs policy), *voice drift*, *genre drift*, *serial drift* (no hook/payoff/pull). |
| **Exemplar** | A short approved English passage used to anchor style. Sources allowed: project's own accepted chapters, user-owned writing, licensed text, studio-authored synthetic exemplars. Never commercial works. |

## Memory & canon

| Term | Definition |
| --- | --- |
| **Canon** | The set of facts, events, states and knowledge established by **accepted** chapters (plus user-locked bible facts). Versioned. A chapter becomes accepted inside the atomic canon commit (ADR-0037). |
| **Canon Version** | Monotonic integer per project, incremented by exactly one atomic canon commit. Every job records the canon version it read. |
| **Canon Commit** | Single atomic transaction that applies a *verified* **Canon Delta**, bumps the canon version exactly once, and marks the source manuscript version `accepted`. Belongs to one change class: transition, correction, retcon, rollback or system-time retraction (ADR-0038). |
| **Canon Delta** | Proposed set of changes extracted from an **approval-locked** (`approved`) manuscript version, each with evidence. Proposals, not truth, until the commit applies them. |
| **Fact** | A typed assertion about an entity with **validity period** (story time) and **assertion period** (system time), evidence, confidence, source chapter, timeline. Bitemporal. |
| **Evidence Span** | Exact **Unicode code-point** offsets (ADR-0030) into an immutable NFC-normalized manuscript version, plus the quoted text and a content hash. |
| **Canonical Event** | Something that happened in the story, with story-time position, participants, location, and reality frame. |
| **Reality Frame** | `canonical`, `flashback`, `dream`, `hallucination`, `lie`, `hypothetical`, `prediction`, `plan`, `prior_loop`, `alternate_timeline`, `source_story`, `non_canonical_draft`. Only reality-bearing frames update objective state. |
| **Timeline** | A branch or parallel reference of story time. Kinds: `main`, `prior_loop`, `alternate` (branches with a divergence point) and `source_story` (parallel reference for possession/villainess stories, no divergence point; ADR-0039). **Proposition truth is per timeline** (ADR-0031). |
| **Story Time** | In-world time, represented as a **story clock**: authoritative *narrative order* (chapter, ordinal) plus optional *world order* (calendar, date, precision, uncertainty) for duration reasoning (ADR-0040). |
| **Knowledge Ledger** | Records, per **proposition** and per **knower** (character, narrator, reader), an epistemic stance: `knows`, `suspects`, `believes_false`, `pretends`, `unaware`, `forgot`, `doubts`, with source and validity. |
| **Proposition** | A canonical statement that can be known/believed; truth value recorded per timeline. |
| **Secret** | A proposition with restricted knowers and an owner; violations are *knowledge leaks*. |
| **Promise** | A setup the story owes a payoff for. Tracked in the **Promise Ledger** with due window and status. |
| **Summary Tier** | Hierarchical summaries: chapter (L1), arc (L2), season (L3), series (L4). Regenerated from accepted text only. |
| **Context Pack** | The versioned, deterministic bundle of context for one LLM call: tiered, budgeted, with a manifest. |
| **Tier** | T0 mandatory (never trimmed), T1 critical (compress only), T2 relevant (rankable/trimmable), T3 optional. |
| **Dependency Edge** | Recorded link "artifact X used canon item Y at canon version V" with a **materiality class**: `material` (fact stated or relied upon in the artifact), `contextual` (retrieved but not evidently used). Only material edges mark dependents stale by default (ADR-0032). |
| **Retcon** | A user-authorized change to accepted canon. Produces a new canon version, marks materially dependent artifacts stale, may trigger manuscript patches. |
| **Stale** | A job/plan/chapter whose recorded canon version is superseded by a commit that touches a material dependency. |

## Generation & quality

| Term | Definition |
| --- | --- |
| **Role** | A named LLM function with its own prompt family, model routing, schema, budget, style sensitivity. |
| **Prompt Version** | Immutable, content-hashed prompt template + schema + config, registered in the Prompt Registry. |
| **Candidate** | One of N alternative outputs for the same task. Lives outside canon; at most one becomes the accepted artifact. |
| **Scorecard** | Structured evaluation result with separate sections for English prose quality, structural adherence, genre adherence, voice, continuity, knowledge, promises, repetition, length. |
| **Issue** | A single finding: kind, severity, confidence, claim, chapter span, conflicting canon, canon evidence, recommended repair. |
| **Patch** | A targeted edit (sentence / paragraph / dialogue line / scene) applied to a manuscript version, producing a new version; regression-tested. |
| **Manuscript Version** | Immutable text snapshot of a chapter with an `origin` (assembled / revision / candidate / retcon / imported) and a lifecycle `status` (working → approved → accepted → superseded / retconned; or rejected → quarantine). **Approved** = approval-locked for extraction; **accepted** = canon committed (ADR-0037). |
| **Length Model** | Language-neutral measurement of a text: words (primary author-facing unit for English), Unicode code points, paragraphs, sentences, estimated tokens, estimated reading time. Targets and tolerances are in the author-facing unit (ADR-0034). |
| **Quality Tier** | Budget/quality preset (Economy / Standard / Premium); selects a **Production Policy** version. |
| **Production Policy** | Versioned data object holding revision limits, candidate policy, per-dimension gate thresholds, context-tail budget, extraction thresholds and the issue-override matrix; the single source for these numbers (ADR-0041). |
| **Override class** | Who may waive an issue: `never` (objective corruption), `canon_workflow` (needs a correction/retcon), `reviewer` (recorded reason), `advisory` (ADR-0042). |
| **Change class** | The kind of canon change a commit makes: transition (story moves on; validity closed, history kept), correction, retcon, rollback, system-time retraction (ADR-0038). |
| **Hard Limit** | Spend ceiling that halts workflows when reached. |

## Korean webnovel tradition terminology (used in narrative-tradition and genre profiles; always glossed)

| Term | Meaning in profiles |
| --- | --- |
| 회차 / 화 (episode) | One serialized installment = one chapter. Platform norms in Korea run roughly 5,000–6,000 Korean characters; in English output the equivalent is a **words** target calibrated per project (ADR-0034), not a converted number. |
| 연재 (serialization) | Ongoing episodic release; the product's structural premise. |
| 사이다 / 고구마 ("cider" / "sweet potato") | Cathartic payoff vs frustrating suppression. Pacing levers: cadence targets in the tradition profile. |
| 먼치킨 (munchkin) | Overpowered protagonist trope. |
| 회귀 / 빙의 / 환생 (regression / possession / reincarnation) | The three core second-chance premises; each has a genre profile. |
| 헌터 / 게이트 / 각성자 (hunter / gate / awakened) | Modern-fantasy dungeon-hunter setting vocabulary; English rendering governed by the terminology policy (default: translate — *hunter*, *gate*, *awakened*). |
| 상태창 (status window) | System-fiction UI text embedded in prose; rendered as English status blocks with fixed grammar. |
| 무협 / 무림 (murim) | Martial-arts fiction / the martial world; terminology policy typically `romanize` for *murim*, *gwangho*, technique names per project. |
| 로판 (romance fantasy) · 악녀 (villainess) · 현판 (modern fantasy) · 아카데미 (academy) | Genre profile names. |
| 번역투 (translation-ese) | Source concept for the *translation-like English* drift class — English that reads as if translated. |
| 호칭 (address terms) · 존대/반말 (formal/informal speech) | Source concepts for the **Dialogue-Register Policy**: preserved as abstract formality/familiarity/deference data and rendered in natural English (titles, address terms, contractions, directness), never as Korean grammar. |
