// scripts/test-analytics.ts
import { getNetworkSummary } from '../src/services/analytics';

async function test() {
  const stats = await getNetworkSummary();
  console.log('📊 Network Stats:', stats);
}

test();