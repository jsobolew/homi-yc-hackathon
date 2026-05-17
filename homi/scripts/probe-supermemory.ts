import 'dotenv/config';
import Supermemory from 'supermemory';

const TAG = 'homi:demo';

async function main() {
  const sm = new Supermemory({ apiKey: process.env.SUPERMEMORY_API_KEY! });

  const queries = [
    'Ricky plumbing past deals',
    'previous HVAC repair price',
    'prior leak repair vendor',
  ];

  for (const q of queries) {
    for (const mode of ['memories', 'hybrid', 'documents'] as const) {
      const r = await sm.search.memories({
        q,
        containerTag: TAG,
        threshold: 0.3,
        limit: 5,
        searchMode: mode,
      });
      console.log(`\nq="${q}" mode=${mode} → ${r.total} hits`);
      for (const x of r.results) {
        console.log(`  ${x.similarity.toFixed(3)}  ${x.memory ?? JSON.stringify(x).slice(0, 120)}`);
      }
    }
  }
}

main().catch((e) => {
  console.error('Probe failed:', e);
  process.exit(1);
});
