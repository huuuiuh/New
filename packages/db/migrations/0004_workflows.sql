-- 0004_workflows.sql — Checkpoint 5: deterministic, resumable chapter-production workflows (ADR-0044, ADR-0046)
--
-- * jobs gain a deterministic workflow id + idempotency key and a `pins` document (prompt set, Production
--   Policy, Narrative Identity, canon version read/written) so a resumed run proves it used the same inputs.
-- * workflow_artifacts is the Postgres-backed artifact store of the modular monolith: step inputs/outputs
--   (Story Spec, arc plan, contracts, scene plans, scene drafts, scorecards, patches, canon deltas) and the
--   outputs of idempotent LLM calls, content-addressed and append-only. llm_calls.artifact_ref points here.
-- * dependency_edges records which canon items an accepted manuscript version was built from (ADR-0032).

ALTER TABLE jobs
  ADD COLUMN workflow_id text UNIQUE,
  ADD COLUMN idempotency_key text UNIQUE,
  ADD COLUMN pins jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN current_step text,
  ADD COLUMN finished_at timestamptz;

CREATE TABLE workflow_artifacts (
  id uuid PRIMARY KEY,                                -- UUIDv8 of content_hash (content-addressed)
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  project_id uuid NOT NULL REFERENCES projects(id),
  job_id uuid REFERENCES jobs(id),
  step text NOT NULL,
  kind text NOT NULL,                                 -- story_spec | arc_plan | chapter_contract | scene_plan | scene_draft | scorecard | patch | canon_delta | llm_output | ...
  key text NOT NULL,                                  -- stable key within (job, step, kind): e.g. "1", "v2", an idempotency key
  schema text,                                        -- schema file the payload validates against, when any
  content_hash text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, step, kind, key)
);
CREATE INDEX workflow_artifacts_job_idx ON workflow_artifacts(job_id, step);
CREATE TRIGGER workflow_artifacts_append_only BEFORE UPDATE OR DELETE ON workflow_artifacts FOR EACH ROW EXECUTE FUNCTION canon.audit_append_only();

CREATE TABLE dependency_edges (
  id uuid PRIMARY KEY DEFAULT canon.uuid_v7(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  project_id uuid NOT NULL REFERENCES projects(id),
  dependent_kind text NOT NULL CHECK (dependent_kind IN ('manuscript_version','chapter_contract','summary')),
  dependent_id uuid NOT NULL,
  canon_item_kind text NOT NULL,
  canon_item_ref text NOT NULL,                       -- canon row id, or composite refs such as <commit>#<local_id>
  source_kind text NOT NULL,
  canon_version_read integer NOT NULL CHECK (canon_version_read >= 0),
  materiality text NOT NULL CHECK (materiality IN ('material','contextual')),
  basis text NOT NULL CHECK (basis IN ('contract_anchor','t0','t1_state','claim_reference','retrieved_t2','promoted_by_user')),
  pack_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, dependent_kind, dependent_id, canon_item_kind, canon_item_ref)
);
CREATE INDEX dependency_edges_item_idx ON dependency_edges(project_id, canon_item_kind, canon_item_ref, materiality);
