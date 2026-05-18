// Runs every per-agent smoke script sequentially.
// Exits non-zero if any one fails.
//
// Run:  pnpm tsx --env-file=.env.local scripts/smoke-all.ts
//
// Skips:
//   - park: needs SSE shape from user; pass --include-park to attempt
//   - sato: real Browser Use cost (~$0.05); pass --include-sato to attempt
//   - ramirez: real Browser Use cost; pass --include-ramirez to attempt

import { spawn } from 'node:child_process';
import path from 'node:path';

interface SmokeDef {
  id: string;
  script: string;
  defaultRun: boolean;
  note?: string;
}

const SMOKES: SmokeDef[] = [
  { id: 'brooks', script: 'smoke-brooks.ts', defaultRun: true },
  { id: 'okafor', script: 'smoke-okafor.ts', defaultRun: true },
  { id: 'chen', script: 'smoke-chen.ts', defaultRun: true },
  {
    id: 'ramirez',
    script: 'smoke-ramirez.ts',
    defaultRun: false,
    note: 'real Browser Use session (~$0.05). Pass --include-ramirez',
  },
  {
    id: 'sato',
    script: 'smoke-sato.ts',
    defaultRun: false,
    note: 'real Browser Use session (~$0.05). Pass --include-sato',
  },
  {
    id: 'park',
    script: 'smoke-park.ts',
    defaultRun: false,
    note: 'real outbound call to Piotr. Pass --include-park',
  },
];

function runSmoke(scriptName: string): Promise<number> {
  return new Promise((resolve) => {
    const scriptPath = path.join('scripts', scriptName);
    const child = spawn(
      'pnpm',
      ['tsx', '--env-file=.env.local', scriptPath],
      { stdio: 'inherit' },
    );
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const onlyArg = [...args].find((a) => a.startsWith('--only='));
  const onlyId = onlyArg?.split('=')[1];

  const toRun = SMOKES.filter((s) => {
    if (onlyId) return s.id === onlyId;
    if (s.defaultRun) return true;
    return args.has(`--include-${s.id}`);
  });

  const skipped = SMOKES.filter((s) => !toRun.includes(s));

  console.log(`\nSmoke plan: ${toRun.map((s) => s.id).join(', ') || '(none)'}`);
  if (skipped.length) {
    console.log(`Skipped: ${skipped.map((s) => `${s.id}${s.note ? ` (${s.note})` : ''}`).join(', ')}`);
  }
  console.log('');

  const results: { id: string; code: number }[] = [];
  for (const s of toRun) {
    console.log(`\n${'━'.repeat(60)}\n▶ ${s.id}\n${'━'.repeat(60)}`);
    const code = await runSmoke(s.script);
    results.push({ id: s.id, code });
  }

  console.log(`\n${'━'.repeat(60)}\nSUMMARY\n${'━'.repeat(60)}`);
  let anyFail = false;
  for (const r of results) {
    const status = r.code === 0 ? 'PASS' : 'FAIL';
    console.log(`  ${status.padEnd(4)}  ${r.id}`);
    if (r.code !== 0) anyFail = true;
  }
  process.exit(anyFail ? 1 : 0);
}

main().catch((e) => {
  console.error('smoke-all crashed:', e);
  process.exit(1);
});
