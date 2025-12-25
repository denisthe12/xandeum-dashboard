// src/services/notifier.ts
import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';

const token = process.env.TELEGRAM_BOT_TOKEN;
const prisma = new PrismaClient();

// Используем polling: false, так как мы только отправляем
const bot = token ? new TelegramBot(token, { polling: false }) : null;

export async function notifySubscribers(nodeIp: string, isNowActive: boolean) {
  if (!bot) return;

  // 1. Находим всех, кто следит за этой нодой И подключил телеграм
  const watchers = await prisma.watchedNode.findMany({
    where: { nodeIp: nodeIp },
    include: { subscriber: true }
  });

  const icon = isNowActive ? '✅' : '🚨';
  const status = isNowActive ? 'ONLINE' : 'OFFLINE';
  const message = `${icon} **Alert:** Node \`${nodeIp}\` is now *${status}*!`;

  // 2. Рассылаем
  for (const watch of watchers) {
    if (watch.subscriber.chatId) {
      try {
        await bot.sendMessage(watch.subscriber.chatId, message, { parse_mode: 'Markdown' });
      } catch (e) {
        console.error(`Failed to send alert to ${watch.subscriber.chatId}`);
      }
    }
  }
}