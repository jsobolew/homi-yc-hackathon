import 'dotenv/config';
import { runBrooksRead, runBrooksWrite } from '../lib/agents/brooks';

async function main() {
  const ctx = {
    dispatchId: 'smoke-1',
    issueId: 'ISS-1180-CASTRO-HVAC',
    propertyId: '1180-castro',
    vendorTrade: 'hvac',
  };

  console.log('\n=== BROOKS READ ===\n');
  for await (const e of runBrooksRead(ctx)) {
    console.log(JSON.stringify(e));
  }

  console.log('\n=== BROOKS WRITE ===\n');
  for await (const e of runBrooksWrite(ctx)) {
    console.log(JSON.stringify(e));
  }
}

main().catch((e) => {
  console.error('smoke failed:', e);
  process.exit(1);
});
