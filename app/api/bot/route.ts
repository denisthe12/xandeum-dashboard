// app/api/bot/route.ts
import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const token = process.env.TELEGRAM_BOT_TOKEN;

// В режиме Webhook polling должен быть false
const bot = token ? new TelegramBot(token, { polling: false }) : null;

export async function POST(req: Request) {
  if (!bot) return NextResponse.json({ error: 'No token' });

  try {
    const body = await req.json();
    
    // Проверяем, что это сообщение с текстом
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id.toString();
      const text = body.message.text;

      // === КОМАНДА /start ===
      if (text.startsWith('/start')) {
        const code = text.split(' ')[1];
        if (code && code.length === 6) {
          // Ищем подписчика по коду
          const subscriber = await prisma.subscriber.findUnique({ where: { connectCode: code } });
          
          if (subscriber) {
            // Привязываем ChatID к подписчику
            await prisma.subscriber.update({
              where: { id: subscriber.id },
              data: { chatId: chatId }
            });
            await bot.sendMessage(chatId, '✅ Connected! You will receive alerts here.');
          } else {
            await bot.sendMessage(chatId, '⚠️ Code not found. Please check your code.');
          }
        } else {
          await bot.sendMessage(chatId, '👋 Welcome! Go to the "Alerts" page on Xandeum Explorer to get your connection code.');
        }
      }
      
      // === КОМАНДА /list (Внедренная логика) ===
      if (text === '/list') {
        // 1. Ищем подписчика по ChatID
        const subscriber = await prisma.subscriber.findFirst({
          where: { chatId: chatId },
          include: { watchedNodes: true }
        });

        // 2. Если нет подписок
        if (!subscriber || subscriber.watchedNodes.length === 0) {
          await bot.sendMessage(chatId, '📭 You are not watching any nodes.');
        } else {
          // 3. Формируем список и отправляем
          const list = subscriber.watchedNodes.map(n => `• \`${n.nodeIp}\``).join('\n');
          await bot.sendMessage(chatId, `👀 *Your Watchlist:*\n${list}`, { parse_mode: 'Markdown' });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Telegram Webhook Error:', e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}