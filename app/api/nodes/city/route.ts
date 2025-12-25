// app/api/nodes/city/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const country = searchParams.get('country');

  if (!city) return NextResponse.json([], { status: 400 });

  try {
    const nodes = await prisma.pNode.findMany({
      where: {
        city: city,
        country: country || undefined, // Если страна есть, учитываем её
        isActive: true, // Показываем только активные ноды в этом месте
      },
      include: {
        stats: {
          take: 1,
          orderBy: { recordedAt: 'desc' }
        }
      },
      orderBy: { healthScore: 'desc' }
    });

    return NextResponse.json(nodes);
  } catch (e) {
    return NextResponse.json({ error: 'DB Error' }, { status: 500 });
  }
}