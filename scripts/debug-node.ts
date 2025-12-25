// scripts/debug-node.ts

import axios from 'axios';

const TARGET_IP = '173.212.207.32:6000';
const NEIGHBOR_IP = '192.190.136.28:6000'; // Сосед, у которого спросим про нашу ноду

async function debugNode() {
  console.log(`🔍 DIAGNOSTIC REPORT FOR: ${TARGET_IP}`);
  console.log('='.repeat(50));

  // 1. Прямое подключение (Check Public Access)
  console.log('\n[1] Checking Direct RPC Access (get-stats)...');
  try {
    const res = await axios.post(`http://${TARGET_IP}/rpc`, {
      jsonrpc: '2.0',
      method: 'get-stats',
      id: 1
    }, { timeout: 5000 });

    if (res.data.result) {
      console.log('✅ DIRECT ACCESS: SUCCESS (Node is Public)');
      console.log('   Uptime:', res.data.result.stats.uptime);
      console.log('   Packets:', res.data.result.stats.packets_received);
    } else {
      console.log('❌ DIRECT ACCESS: FAILED (Empty result)');
    }
  } catch (e: any) {
    console.log(`❌ DIRECT ACCESS: FAILED (${e.message})`);
  }

  // 2. Проверка через Gossip (Check Metadata)
  console.log(`\n[2] Asking neighbor (${NEIGHBOR_IP}) about target...`);
  try {
    const res = await axios.post(`http://${NEIGHBOR_IP}/rpc`, {
      jsonrpc: '2.0',
      method: 'get-pods-with-stats',
      id: 1
    }, { timeout: 10000 });

    const pods = res.data.result?.pods || [];
    // Ищем нашу ноду в списке (ищем по IP без порта или с портом 9001)
    const targetIpSimple = TARGET_IP.split(':')[0];
    const foundPod = pods.find((p: any) => p.address.includes(targetIpSimple));

    if (foundPod) {
      console.log('✅ GOSSIP: FOUND!');
      console.log(JSON.stringify(foundPod, null, 2));
      
      if (!foundPod.pubkey) console.warn('⚠️ WARNING: PubKey is MISSING in Gossip data!');
      if (!foundPod.is_public) console.warn('⚠️ WARNING: Gossip thinks this node is PRIVATE!');
    } else {
      console.log('❌ GOSSIP: Node NOT FOUND in neighbor list.');
    }

  } catch (e: any) {
    console.log(`❌ GOSSIP CHECK FAILED (${e.message})`);
  }
}

debugNode();