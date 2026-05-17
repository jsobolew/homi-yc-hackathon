import 'dotenv/config';
import Supermemory from 'supermemory';

const TAG = 'homi:demo';

const SEED = [
  {
    key: 'deal.1180-castro.hvac.2026-03-02',
    value:
      'vendor=Ricky’s Heating & Air price=$720 booked=next-day saved=$60 vs market avg $780',
  },
  {
    key: 'deal.1102-castro.leak.2026-01-14',
    value:
      'vendor=Ricky’s Heating & Air price=$580 booked=same-day saved=$90 vs market avg $670',
  },
  {
    key: 'deal.0998-mission.drain.2025-11-22',
    value:
      'vendor=Ricky’s Heating & Air price=$410 booked=2hr saved=$40 vs market avg $450',
  },
];

async function main() {
  const apiKey = process.env.SUPERMEMORY_API_KEY;
  if (!apiKey) throw new Error('SUPERMEMORY_API_KEY not set');

  const sm = new Supermemory({ apiKey });

  for (const { key, value } of SEED) {
    const r = await sm.documents.add({
      content: `${key}: ${value}`,
      containerTag: TAG,
      metadata: { key },
    });
    console.log('seeded', key, '→', r.id);
  }

  // Memory ingestion is async; wait a few seconds before sanity-checking.
  console.log('\nWaiting 5s for ingestion...');
  await new Promise((r) => setTimeout(r, 5000));

  const probe = await sm.search.memories({
    q: 'Ricky plumbing past deals',
    containerTag: TAG,
    threshold: 0.3,
    limit: 5,
  });
  console.log(`\nSearch probe → ${probe.total} hits`);
  for (const r of probe.results) {
    console.log(`  ${r.similarity.toFixed(3)}  ${r.memory ?? '(no memory text)'}`);
  }
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
