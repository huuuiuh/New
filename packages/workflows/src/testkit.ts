/**
 * Harness for the Checkpoint 5 replay fixture (examples/fixture/ch01): a project pinned to the fixture
 * identity and the standard policy, a ReplayProvider over `replay.ch01.json`, and a Gateway wired to the
 * Postgres audit store with the artifact-backed output store. No live provider is ever configured.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createProject, createWorkspace, PgAuditStore, type Pool } from '@yeonjae/db';
import { Gateway, MemoryBudget, ReplayProvider, type RoutingTable } from '@yeonjae/gateway';
import { type ChapterProductionInput } from './chapter-production.js';
import { type StoryBible } from './planning.js';
import { ArtifactLlmOutputStore } from './runtime.js';

export const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
export const FIXTURE_DIR = `${ROOT}examples/fixture/ch01/`;

export const IDS = JSON.parse(readFileSync(`${FIXTURE_DIR}ids.ch01.json`, 'utf8')) as Record<
  string,
  string
>;
export const INTAKE = JSON.parse(
  readFileSync(`${ROOT}examples/fixture/story-intake.json`, 'utf8'),
) as unknown;
export const BIBLE = JSON.parse(
  readFileSync(`${FIXTURE_DIR}story-bible.ch01.json`, 'utf8'),
) as StoryBible;
export const EXPECTED = JSON.parse(readFileSync(`${FIXTURE_DIR}expected.ch01.json`, 'utf8')) as {
  assembled_code_points: number;
  revised_code_points: number;
  assembled_paragraphs: number;
  bad_sentence: { quote: string; start: number; end: number; paragraph_id: string };
  revised_sentence: string;
  ending_hook: string;
  words: { assembled: number; revised: number };
  scene_words: number[];
  delta_items: number;
};

export const IDENTITY_REF = 'project/0191b2a0-0000-7000-8000-000000000001@1';
export const IDENTITY_VERSION = '0191b2a0-0000-7000-8000-000000060001';

const route = (modelId: string, family: string) => ({
  modelId,
  provider: 'replay',
  priority: 1,
  family,
  priceInPerMTokCents: 100,
  priceOutPerMTokCents: 400,
  maxContextTokens: 200_000,
  supportsJsonSchema: true,
});

/** Every class routes to the replay provider; the P-class writer and the M/C judges are different families. */
export const REPLAY_ROUTING: RoutingTable = {
  R: [route('replay-r', 'alpha')],
  P: [route('replay-p', 'alpha')],
  M: [route('replay-m', 'beta')],
  C: [route('replay-c', 'beta')],
  E: [],
};

export function replayProvider(bindings: () => Readonly<Record<string, string>>): ReplayProvider {
  return ReplayProvider.fromFile(`${FIXTURE_DIR}replay.ch01.json`, { name: 'replay', bindings });
}

export interface Harness {
  readonly pool: Pool;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly mainTimelineId: string;
  readonly provider: ReplayProvider;
  readonly bindings: Record<string, string>;
  gateway(jobScope?: { jobId?: string | undefined }): Gateway;
  input(chapterNo: number, extra?: Partial<ChapterProductionInput>): ChapterProductionInput;
}

export async function createHarness(pool: Pool, title = 'Second Awakening'): Promise<Harness> {
  const workspaceId = await createWorkspace(pool, 'ch01-fixture');
  const { projectId, mainTimelineId } = await createProject(pool, {
    workspaceId,
    title,
    settings: {
      narrative_identity_ref: IDENTITY_REF,
      narrative_identity_version_id: IDENTITY_VERSION,
    },
  });
  const bindings: Record<string, string> = {};
  const provider = replayProvider(() => bindings);
  return {
    pool,
    workspaceId,
    projectId,
    mainTimelineId,
    provider,
    bindings,
    gateway() {
      return new Gateway({
        providers: new Map([['replay', provider]]),
        routing: REPLAY_ROUTING,
        budget: new MemoryBudget(1_000_000),
        audit: new PgAuditStore(
          pool,
          { workspaceId, projectId },
          new ArtifactLlmOutputStore(pool, { workspaceId, projectId }),
        ),
        guardContext: { pinnedIdentityVersionId: IDENTITY_VERSION },
        minEnglishConfidence: 0.99,
      });
    },
    input(chapterNo, extra = {}) {
      return {
        projectId,
        chapterNo,
        intake: INTAKE,
        bible: BIBLE,
        ids: {
          arcId: IDS.arc1 ?? '',
          seasonId: IDS.season1 ?? '',
          contractId: chapterNo === 1 ? (IDS.contract1 ?? '') : (IDS.contract2 ?? ''),
        },
        ...extra,
      };
    },
  };
}
