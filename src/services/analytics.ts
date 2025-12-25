// src/services/analytics.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface NetworkSummary {
  totalActiveNodes: number;
  totalDiscoveredNodes: number;
  
  storageActive: number; // Storage on Active Nodes
  storageAll: number;    // Storage on All Nodes (Total Committed)
  
  averageLatencyMs: number;
  
  topCountries: { country: string; count: number }[];
  countriesActiveCount: number;
  countriesAllCount: number;
}

export async function getNetworkSummary(): Promise<NetworkSummary> {
  // 1. Количество
  const totalDiscovered = await prisma.pNode.count();
  const totalActive = await prisma.pNode.count({ where: { isActive: true } });

  // 2. Хранилище (Активное)
  const storageActiveAgg = await prisma.pNode.aggregate({
    where: { isActive: true },
    _sum: { currentStorageBytes: true }
  });

  // 3. Хранилище (Всего известного / Committed History)
  // Включаем даже офлайн ноды, так как это "Committed Capacity" сети
  const storageAllAgg = await prisma.pNode.aggregate({
    _sum: { currentStorageBytes: true }
  });

  // 4. Пинг (только у живых RPC)
  const rpcAggregates = await prisma.pNode.aggregate({
    where: { isRpcActive: true, isActive: true },
    _avg: { lastLatencyMs: true },
  });

  // 5. Страны (Активные)
  const countriesActive = await prisma.pNode.groupBy({
    by: ['country'],
    where: { isActive: true, country: { not: null, notIn: ['Unknown', ''] } },
  });

  // 6. Страны (Все)
  const countriesAll = await prisma.pNode.groupBy({
    by: ['country'],
    where: { country: { not: null, notIn: ['Unknown', ''] } },
  });

  // Топ стран для списка (берем активные, это интереснее)
  const topCountries = await prisma.pNode.groupBy({
    by: ['country'],
    where: { isActive: true, country: { not: null, notIn: ['Unknown', ''] } },
    _count: { country: true },
    orderBy: { _count: { country: 'desc' } },
    take: 5,
  });

  return {
    totalActiveNodes: totalActive,
    totalDiscoveredNodes: totalDiscovered,
    
    storageActive: storageActiveAgg._sum.currentStorageBytes || 0,
    storageAll: storageAllAgg._sum.currentStorageBytes || 0,
    
    averageLatencyMs: Math.round(rpcAggregates._avg.lastLatencyMs || 0),
    
    topCountries: topCountries.map(g => ({
      country: g.country || 'Unknown',
      count: g._count.country
    })),
    
    countriesActiveCount: countriesActive.length,
    countriesAllCount: countriesAll.length,
  };
}

// График роста считаем по ВСЕМ известным нодам (история сети)
export async function getNetworkGrowth() {
  const nodes = await prisma.pNode.findMany({
    select: { firstSeenAt: true },
    orderBy: { firstSeenAt: 'asc' },
  });

  // Группируем по дням
  const newNodesByDay = new Map<string, number>();
  nodes.forEach(node => {
    const date = node.firstSeenAt.toISOString().split('T')[0];
    newNodesByDay.set(date, (newNodesByDay.get(date) || 0) + 1);
  });

  const chartData: { date: string; count: number }[] = [];
  const today = new Date();
  
  // Мы хотим показать 7 точек: сегодня, вчера... -6 дней.
  // Найдем даты этих 7 точек.
  const chartDates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    chartDates.push(d.toISOString().split('T')[0]);
  }

  // Считаем Running Total:
  // Это (ВСЕ НОДЫ) минус (Сумма нод, которые появились в эти 7 дней)
  let totalInChartRange = 0;
  chartDates.forEach(date => {
    totalInChartRange += (newNodesByDay.get(date) || 0);
  });

  let runningTotal = nodes.length - totalInChartRange;

  // Теперь строим график
  chartDates.forEach(dateStr => {
    const newToday = newNodesByDay.get(dateStr) || 0;
    runningTotal += newToday;
    chartData.push({ date: dateStr, count: runningTotal });
  });

  return chartData;
}

// ISP считаем для всех (чтобы показать децентрализацию всей инфраструктуры)
export async function getProviderDistribution() {
  const groups = await prisma.pNode.groupBy({
    by: ['isp'],
    where: { isp: { not: null, notIn: ['Unknown', ''] } },
    _count: { isp: true },
    orderBy: { _count: { isp: 'desc' } }
  });

  const top5 = groups.slice(0, 5).map(g => ({
    name: g.isp || 'Unknown',
    value: g._count.isp
  }));

  const othersCount = groups.slice(5).reduce((acc, curr) => acc + curr._count.isp, 0);
  if (othersCount > 0) top5.push({ name: 'Others', value: othersCount });

  return top5;
}

export async function getMapData() {
  // На карте показываем ВСЕХ (пусть будет видно масштаб)
  // Или можно добавить фильтр isActive: true, если хочешь только живых
  const groups = await prisma.pNode.groupBy({
    by: ['city', 'country'],
    where: { latitude: { not: null }, longitude: { not: null } },
    _count: { id: true },
  });

  const result = await Promise.all(groups.map(async (group) => {
    const node = await prisma.pNode.findFirst({
      where: { city: group.city, country: group.country, latitude: { not: null } },
      select: { latitude: true, longitude: true }
    });
    return {
      city: group.city || 'Unknown',
      country: group.country || 'Unknown',
      count: group._count.id,
      lat: node?.latitude || 0,
      lng: node?.longitude || 0,
    };
  }));
  return result;
}

export async function getActivityLogs() {
    return prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
}