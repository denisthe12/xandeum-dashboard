// scripts/check-specific-node.ts
import axios from 'axios';

// Одна из проблемных нод
const TARGET_IP = '192.190.136.37:6000';
// Надежный сосед
const NEIGHBOR_IP = '173.212.207.32:6000';

async function check() {
  console.log(`🕵️‍♀️ Investigating ${TARGET_IP}...\n`);

  // ТЕСТ 1: Прямое подключение (get-stats)
  // Отсюда мы берем CPU, RAM, Packets, Height
  console.log(`[1] Trying Direct Connection (get-stats)...`);
  try {
    const res = await axios.post(`http://${TARGET_IP}/rpc`, {
      jsonrpc: '2.0', method: 'get-stats', id: 1
    }, { timeout: 5000 }); // Таймаут 5 сек
    
    console.log('✅ Direct Connect: SUCCESS');
    console.log('   Data:', JSON.stringify(res.data.result, null, 2));
  } catch (e: any) {
    console.log(`❌ Direct Connect: FAILED`);
    console.log(`   Error: ${e.message}`);
    if (e.code === 'ECONNREFUSED') console.log('   -> Port closed (Firewall?)');
    if (e.code === 'ETIMEDOUT') console.log('   -> Timeout (Node is slow or filtering IP)');
  }

  // ТЕСТ 2: Опрос через Gossip (get-pods-with-stats)
  // Отсюда мы берем Storage и Uptime (резервный)
  console.log(`\n[2] Checking Gossip Info via ${NEIGHBOR_IP}...`);
  try {
    const res = await axios.post(`http://${NEIGHBOR_IP}/rpc`, {
      jsonrpc: '2.0', method: 'get-pods-with-stats', id: 1
    });
    
    const pods = res.data.result?.pods || [];
    // Ищем нашу ноду (убираем :6000, так как в gossip она может быть :9001)
    const targetIpSimple = TARGET_IP.split(':')[0]; 
    const pod = pods.find((p: any) => p.address.includes(targetIpSimple));

    if (pod) {
      console.log('✅ Gossip: FOUND');
      console.log(`   is_public: ${pod.is_public}`);
      console.log(`   uptime: ${pod.uptime} (seconds)`);
      console.log(`   storage_committed: ${pod.storage_committed}`);
      console.log(`   version: ${pod.version}`);
    } else {
      console.log('❌ Gossip: Node NOT FOUND in neighbor list');
    }

  } catch (e: any) {
    console.log(`❌ Gossip Check Failed: ${e.message}`);
  }
}

check();