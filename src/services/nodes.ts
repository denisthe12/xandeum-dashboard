// src/services/nodes.ts

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface NodesFilter {
  query?: string;
  status?: string;
  country?: string;
  version?: string;
  type?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  
  // Новые параметры пагинации
  page?: number;
  pageSize?: number;
}

// Изменили возвращаемый тип: теперь это объект { nodes, total }
export async function getNodes(filter: NodesFilter) {
  const page = filter.page || 1;
  const pageSize = filter.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.PNodeWhereInput = {};

  if (filter.status === 'active') where.isActive = true;
  if (filter.query) where.ipAddress = { contains: filter.query };
  if (filter.country && filter.country !== 'all') where.country = filter.country;
  if (filter.version && filter.version !== 'all') where.version = filter.version;
  if (filter.type === 'public') where.isRpcActive = true;
  if (filter.type === 'private') where.isRpcActive = false;

  let orderBy: Prisma.PNodeOrderByWithRelationInput = { healthScore: 'desc' };

  if (filter.sort && filter.order) {
    const dir = filter.order;
    switch (filter.sort) {
      case 'credits': orderBy = { credits: dir }; break;
      case 'height': orderBy = { blockHeight: dir }; break;
      case 'storage': orderBy = { usedStorageBytes: dir }; break;
      case 'uptime': orderBy = { gossipUptime: dir }; break; 
      case 'score': orderBy = { healthScore: dir }; break;
      case 'rank': orderBy = { healthScore: dir === 'asc' ? 'desc' : 'asc' }; break;
    }
  }

  // Делаем два запроса в транзакции: данные и общее кол-во
  const [nodes, total] = await prisma.$transaction([
    prisma.pNode.findMany({
      where,
      orderBy,
      take: pageSize, // Берем только 20 штук
      skip: skip,     // Пропускаем предыдущие страницы
      include: {
        stats: {
          take: 1,
          orderBy: { recordedAt: 'desc' }
        }
      }
    }),
    prisma.pNode.count({ where }) // Считаем сколько всего нод подходит под фильтр
  ]);

  return { nodes, total };
}

// 2. Детали одной ноды (ИСПРАВЛЕН ПОИСК)
export async function getNodeDetail(ipAddress: string) {
  const cleanIp = decodeURIComponent(ipAddress);
  return prisma.pNode.findUnique({
    where: { ipAddress: cleanIp },
    include: {
      stats: { orderBy: { recordedAt: 'asc' }, take: -200 }
    }
  });
}

// 3. Для страницы сравнения
export async function getNodesByIds(ids: string[]) {
  return prisma.pNode.findMany({
    where: { id: { in: ids } },
    include: { stats: { take: 1, orderBy: { recordedAt: 'desc' } } }
  });
}

// 4. Опции фильтров
export async function getFilterOptions() {
  const countries = await prisma.pNode.groupBy({
    by: ['country'],
    where: { country: { not: null } },
    _count: { country: true },
    orderBy: { _count: { country: 'desc' } },
  });

  const versions = await prisma.pNode.groupBy({
    by: ['version'],
    where: { version: { not: null } },
    orderBy: { version: 'desc' },
  });

  return {
    countries: countries.map(c => c.country!),
    versions: versions.map(v => v.version!)
  };
}

export async function getAllActiveIPs() {
  return prisma.pNode.findMany({
    where: { isActive: true },
    select: { id: true, ipAddress: true },
    orderBy: { ipAddress: 'asc' }
  });
}