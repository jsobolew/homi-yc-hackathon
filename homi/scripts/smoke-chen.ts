import 'dotenv/config';
import { runChen } from '../lib/agents/chen';

async function main() {
  const ctx = {
    dispatchId: 'smoke-1',
    issueId: 'ISS-1180-CASTRO-HVAC',
    propertyId: '1180-castro',
    vendorTrade: 'hvac',
  };

  for await (const e of runChen(ctx)) {
    console.log(JSON.stringify(e));
  }
}

main().catch((e) => {
  console.error('smoke failed:', e);
  process.exit(1);
});
