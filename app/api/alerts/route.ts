// app/api/alerts/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Добавить/Удалить ноду из отслеживания
export async function POST(req: Request) {
  try {
    const { code, ip, action } = await req.json();

    // 1. Ищем или создаем подписчика по коду
    let subscriber = await prisma.subscriber.findUnique({
      where: { connectCode: code }
    });

    if (!subscriber) {
      subscriber = await prisma.subscriber.create({
        data: { connectCode: code }
      });
    }

    if (action === 'add') {
      // Добавляем подписку
      await prisma.watchedNode.upsert({
        where: {
          subscriberId_nodeIp: {
            subscriberId: subscriber.id,
            nodeIp: ip
          }
        },
        create: {
          subscriberId: subscriber.id,
          nodeIp: ip
        },
        update: {}
      });
    } else if (action === 'remove') {
      // Удаляем подписку
      await prisma.watchedNode.deleteMany({
        where: {
          subscriberId: subscriber.id,
          nodeIp: ip
        }
      });
    } else if (action === 'get') {
       // Просто возвращаем список (ничего не меняем)
    }

    // Возвращаем актуальный список подписок
    const watched = await prisma.watchedNode.findMany({
      where: { subscriberId: subscriber.id },
      select: { nodeIp: true }
    });

    return NextResponse.json({ 
      success: true, 
      watched: watched.map(w => w.nodeIp),
      isConnected: !!subscriber.chatId // Сообщаем, подключен ли телеграм
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'DB Error' }, { status: 500 });
  }
}