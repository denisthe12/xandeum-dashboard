// app/api/refresh/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { fetchNodeMetrics } from '../../../src/services/crawler'; // Импортируем логику из краулера

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { ips } = await req.json(); // Ожидаем массив IP ['1.2.3.4:6000']

    if (!ips || !Array.isArray(ips)) {
      return NextResponse.json({ error: 'Invalid IPs' }, { status: 400 });
    }
    console.log(`🔄 Manual refresh for: ${ips.join(', ')}`);

    // Находим ноды в базе
    const nodes = await prisma.pNode.findMany({
      where: { ipAddress: { in: ips } }
    });

    console.log(`   Found ${nodes.length} nodes in DB`);
    // Запускаем обновление параллельно
    await Promise.all(nodes.map(node => fetchNodeMetrics(node)));
    console.log(`✅ Refresh complete`);

    return NextResponse.json({ success: true, count: nodes.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
}