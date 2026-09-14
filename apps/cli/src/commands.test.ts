import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { run } from './commands.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const ch09 = `${root}examples/fixture/manuscripts/ch09.accepted.txt`;
const delta = `${root}examples/fixture/canon-delta.ch09.json`;

describe('cli commands', () => {
  it('lists schemas and policies', () => {
    expect(run(['schemas']).ok).toBe(true);
    const p = run(['policies']);
    expect(p.ok).toBe(true);
    expect((p.output as { ref: string }[]).map((x) => x.ref)).toEqual([
      'policy/economy@1',
      'policy/premium@1',
      'policy/standard@1',
    ]);
  });

  it('validates fixture examples against their schemas', () => {
    expect(run(['validate', 'canon-delta.schema.json', delta]).ok).toBe(true);
    expect(run(['validate', 'story-intake.schema.json', delta]).ok).toBe(false);
  });

  it('measures, language-checks and verifies evidence for the fixture chapter', () => {
    const m = run(['measure', ch09]);
    expect(m.ok).toBe(true);
    expect((m.output as { words: number }).words).toBeGreaterThan(2000);
    expect(run(['language-check', ch09]).ok).toBe(true);
    const v = run(['verify-evidence', ch09, delta]);
    expect(v.ok, JSON.stringify(v.output)).toBe(true);
  });

  it('compiles the fixture identity block and lists the prompt set', () => {
    const b = run([
      'identity:compile',
      'project/0191b2a0-0000-7000-8000-000000000001@1',
      'writer_full',
    ]);
    expect(b.ok).toBe(true);
    const out = b.output as { sections: string[]; text: string };
    expect(out.sections.slice(0, 3)).toEqual([
      'header',
      'output_language_contract',
      'tradition_contract',
    ]);
    expect(out.text).toContain('## Output-Language Contract');
    const p = run(['prompts:list']);
    expect(p.ok).toBe(true);
    expect((p.output as { versions: unknown[] }).versions).toHaveLength(24);
  });

  it('prints usage on unknown commands', () => {
    const r = run(['nope']);
    expect(r.ok).toBe(false);
    expect(String(r.output)).toContain('yeonjae <command>');
  });
});
