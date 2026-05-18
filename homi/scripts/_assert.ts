// Shared assertion helper for per-agent smoke scripts.
//
// Usage:
//   const a = createAsserter('brooks');
//   a.expect(memoryReadFired, 'memory_read event fired');
//   a.expect(text.includes('Ricky'), 'transcript mentions Ricky');
//   process.exit(a.summarize());   // 0 = PASS, 1 = FAIL

export interface AssertResult {
  ok: boolean;
  msg: string;
}

export interface Asserter {
  expect(cond: unknown, msg: string): void;
  note(msg: string): void;
  summarize(): number;
  results: AssertResult[];
}

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

export function createAsserter(label: string): Asserter {
  const results: AssertResult[] = [];
  return {
    results,
    expect(cond, msg) {
      const ok = Boolean(cond);
      results.push({ ok, msg });
      if (ok) console.log(`  ${GREEN}✓${RESET} ${msg}`);
      else console.log(`  ${RED}✗${RESET} ${msg}`);
    },
    note(msg) {
      console.log(`  ${DIM}· ${msg}${RESET}`);
    },
    summarize() {
      const failed = results.filter((r) => !r.ok);
      const passed = results.length - failed.length;
      console.log('');
      if (failed.length === 0) {
        console.log(`${BOLD}${GREEN}PASS${RESET} — ${label}: ${passed}/${results.length} checks`);
        return 0;
      }
      console.log(
        `${BOLD}${RED}FAIL${RESET} — ${label}: ${failed.length}/${results.length} checks failed`,
      );
      for (const f of failed) console.log(`  ${RED}✗${RESET} ${f.msg}`);
      return 1;
    },
  };
}

export function header(label: string): void {
  console.log('');
  console.log(`${BOLD}=== ${label} ===${RESET}`);
  console.log('');
}
