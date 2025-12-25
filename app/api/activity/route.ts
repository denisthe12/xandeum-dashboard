// app/api/activity/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Запрещаем кэширование, чтобы логи были свежими
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20, // Последние 20 событий
    });
    return NextResponse.json(logs);
  } catch (e) {
    return NextResponse.json({ error: 'DB Error' }, { status: 500 });
  }
}