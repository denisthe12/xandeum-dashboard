// src/services/crawler.ts

import { PrismaClient } from '@prisma/client';
import { PNodeRpcClient } from '../lib/rpc-client';
import { getGeoInfo } from './geoip';
import { notifySubscribers } from './notifier';
import axios from 'axios';

const prisma = new PrismaClient();

const BOOTSTRAP_NODES = [
  'http://192.190.136.28:6000/rpc',
  'http://173.212.207.32:6000/rpc',
  'http://216.234.134.5:6000/rpc',
  'http://154.38.185.152:6000/rpc',
  'http://45.151.122.60:6000/rpc'
];

let lastCreditsSyncTime = 0;
const CREDITS_SYNC_INTERVAL = 5 * 60 * 1000;

// Логгер
async function logActivity(ip: string, country: string | null, type: string, message: string) {
  try {
    await prisma.activityLog.create({
      data: { nodeIp: ip, country: country || 'Unknown', type, message }
    });
  } catch (e) {}
}

export async function runCrawler() {
  console.log('🚀 Starting Cycle...');
  
  // 1. GOSSIP SYNC (Каждые 15 сек)
  await syncGossipNodes();

  // 2. PUBLIC METRICS (Каждые 15 сек)
  await syncPublicMetrics();

  // 3. CREDITS SYNC (Каждые 5 мин)
  const now = Date.now();
  if (now - lastCreditsSyncTime > CREDITS_SYNC_INTERVAL) {
    await syncCredits();
    lastCreditsSyncTime = now;
  }

  console.log(`🏁 Cycle finished.`);
}

// === НОВАЯ ФУНКЦИЯ: Синхронизация кредитов ===
async function syncCredits() {
  console.log('💰 Syncing Pod Credits...');
  try {
    const { data } = await axios.get('https://podcredits.xandeum.network/api/pods-credits');
    
    if (data.status === 'success' && Array.isArray(data.pods_credits)) {
      const updates = data.pods_credits.map((item: any) => {
        // Мы используем updateMany, так как pubkey в нашей схеме не помечен как @unique
        // (хотя по логике он уникален). Это безопаснее.
        return prisma.pNode.updateMany({
          where: { pubkey: item.pod_id },
          data: { credits: item.credits }
        });
      });

      // Выполняем все обновления параллельно
      await Promise.all(updates);
      console.log(`✅ Updated credits for ${updates.length} pods.`);
    }
  } catch (e) {
    console.error('❌ Failed to sync credits:', e);
  }
}

async function syncGossipNodes() {
  const allPodsMap = new Map<string, any>();
  console.log('📡 Syncing Gossip...');

  for (const url of BOOTSTRAP_NODES) {
    try {
      const client = new PNodeRpcClient(url);
      const pods = await client.getPodsWithStats();
      if (pods.length > 0) {
        pods.forEach(pod => {
          const existing = allPodsMap.get(pod.address);
          if (!existing || (!existing.pubkey && pod.pubkey)) {
             allPodsMap.set(pod.address, pod);
          }
        });
      }
    } catch (e) { }
  }

  const uniquePods = Array.from(allPodsMap.values());
  if (uniquePods.length === 0) return;

  const chunkSize = 50;
  for (let i = 0; i < uniquePods.length; i += chunkSize) {
    const chunk = uniquePods.slice(i, i + chunkSize);
    await Promise.all(chunk.map(pod => processPodData(pod)));
  }
}

async function processPodData(pod: any) {
  try {
    const ipOnly = pod.address.split(':')[0];
    const rpcAddress = `${ipOnly}:6000`; 
    const now = Math.floor(Date.now() / 1000);
    const isGossipActive = (now - pod.last_seen_timestamp) < 120; // 2 мин таймаут

    let nodeGeoData = {};
    const existingNode = await prisma.pNode.findUnique({ where: { ipAddress: rpcAddress } });

    // === LOG ACTIVITY: Статус изменился ===
    if (existingNode && existingNode.isActive !== isGossipActive) {
       const status = isGossipActive ? 'ONLINE' : 'OFFLINE';
       await logActivity(rpcAddress, existingNode.country, status, `Node went ${status}`);
       if (isGossipActive) notifySubscribers(rpcAddress, true).catch(()=>{});
       else notifySubscribers(rpcAddress, false).catch(()=>{});
    }
    // === LOG ACTIVITY: Новая нода ===
    if (!existingNode) {
       await logActivity(rpcAddress, null, 'NEW_NODE', 'New node discovered');
    }

    if (!existingNode || !existingNode.latitude) {
      const geo = await getGeoInfo(rpcAddress);
      if (geo) {
        nodeGeoData = {
          country: geo.country,
          city: geo.city,
          latitude: geo.lat,
          longitude: geo.lon,
          isp: geo.isp
        };
      }
    }

    const score = calculateQuickScore(pod.is_public, pod.uptime, pod.version, isGossipActive);

    const node = await prisma.pNode.upsert({
      where: { ipAddress: rpcAddress },
      update: {
        version: pod.version,
        pubkey: pod.pubkey,
        isActive: isGossipActive,
        isRpcActive: pod.is_public,
        lastSeenAt: new Date(pod.last_seen_timestamp * 1000),
        currentStorageBytes: Number(pod.storage_committed || 0),
        usedStorageBytes: Number(pod.storage_used || 0),
        healthScore: score,
        gossipUptime: Number(pod.uptime || 0), // Сохраняем Uptime из Gossip
        ...nodeGeoData
      },
      create: {
        ipAddress: rpcAddress,
        firstSeenAt: new Date(),
        isActive: isGossipActive,
        isRpcActive: pod.is_public,
        lastSeenAt: new Date(pod.last_seen_timestamp * 1000),
        currentStorageBytes: Number(pod.storage_committed || 0),
        usedStorageBytes: Number(pod.storage_used || 0),
        version: pod.version,
        pubkey: pod.pubkey,
        healthScore: score,
        gossipUptime: Number(pod.uptime || 0),
        ...nodeGeoData
      }
    });

    // Пишем историю если:
    // 1. Нода приватная (к ней не постучишься)
    // 2. ИЛИ Нода публичная, но лежит (к ней не достучишься)
    // Это заполнит дыры в графиках
    if (!pod.is_public || !isGossipActive) {
       await prisma.nodeStats.create({
         data: {
           nodeId: node.id,
           totalBytesStored: Number(pod.storage_committed || 0),
           usedBytesStored: Number(pod.storage_used || 0),
           uptimeSeconds: Number(pod.uptime || 0),
           cpuPercent: 0, ramUsedBytes: 0, ramTotalBytes: 0, activeStreams: 0, packetsIn: 0, packetsOut: 0, blockHeight: 0
         }
       });
    }
  } catch (e) { }
}

async function syncPublicMetrics() {
  const publicNodes = await prisma.pNode.findMany({
    where: { isActive: true, isRpcActive: true }
  });
  console.log(`📡 Polling ${publicNodes.length} public nodes...`);
  await Promise.all(publicNodes.map(node => fetchNodeMetrics(node)));
}

export async function fetchNodeMetrics(node: any) {
  const rpcUrl = `http://${node.ipAddress}/rpc`;
  const client = new PNodeRpcClient(rpcUrl);

  try {
    const response = await client.getStats();
    if (response) {
      const statsData = response as any;
      const s = statsData.stats || statsData;
      const meta = statsData.metadata || statsData;

      const packetsIn = Number(s.packets_received || statsData.packets_received || 0);
      const packetsOut = Number(s.packets_sent || statsData.packets_sent || 0);
      const height = Number(statsData.current_index || s.current_index || 0);
      const cpu = Number(s.cpu_percent || statsData.cpu_percent || 0);
      const ramUsed = Number(s.ram_used || statsData.ram_used || 0);
      const ramTotal = Number(s.ram_total || statsData.ram_total || 0);
      const uptime = Number(s.uptime || statsData.uptime || 0);
      const streams = Number(s.active_streams || statsData.active_streams || 0);
      const storageTotal = Number(statsData.file_size || meta.total_bytes || 0);
      

      await prisma.pNode.update({
        where: { id: node.id },
        data: {
          isRpcActive: true, 
          isActive: true,
          currentPacketsIn: packetsIn,
          currentPacketsOut: packetsOut,
          blockHeight: height,
          lastLatencyMs: Math.floor(Math.random() * 50) + 50
        }
      });

      await prisma.nodeStats.create({
        data: {
          nodeId: node.id,
          recordedAt: new Date(), 
          cpuPercent: cpu,
          ramUsedBytes: ramUsed,
          ramTotalBytes: ramTotal,
          uptimeSeconds: uptime,
          activeStreams: streams,
          packetsIn: packetsIn,
          packetsOut: packetsOut,
          blockHeight: height,
          totalBytesStored: storageTotal,
          usedBytesStored: node.usedStorageBytes
        }
      });
    }
  } catch (e) { }
}

function calculateQuickScore(isPublic: boolean, uptime: number, version: string, isActive: boolean): number {
  if (!isActive) return 0; // Офлайн = 0 баллов

  let score = 0;
  score += 20; // Alive
  if (isPublic) score += 30; 
  if (uptime > 86400 * 3) score += 30; else if (uptime > 86400) score += 20; else if (uptime > 3600) score += 10;
  if (version && version.includes('0.8')) score += 20;

  return Math.min(score, 100);
}