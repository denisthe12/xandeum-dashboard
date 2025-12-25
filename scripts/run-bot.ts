// scripts/run-bot.ts
require('dotenv').config();
import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const prisma = new PrismaClient();

console.log('🤖 Telegram Bot started...');

// Обработка команды /start 123456
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id.toString();
  const code = match ? match[1] : null;

  if (!code || code.length !== 6) {
    bot.sendMessage(chatId, '❌ Invalid code format. Please send /start 123456');
    return;
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { connectCode: code }
    });

    if (subscriber) {
      // Обновляем ChatID
      await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { chatId: chatId }
      });
      bot.sendMessage(chatId, '✅ Successfully connected! You will now receive alerts for your watched nodes.');
      console.log(`Linked user ${code} to chat ${chatId}`);
    } else {
      bot.sendMessage(chatId, '⚠️ Code not found. Please visit the website to generate a code.');
    }
  } catch (e) {
    bot.sendMessage(chatId, '❌ Error connecting.');
  }
});

// Обработка команды /list (показать список)
bot.onText(/\/list/, async (msg) => {
  const chatId = msg.chat.id.toString();
  
  const subscriber = await prisma.subscriber.findFirst({
    where: { chatId: chatId },
    include: { watchedNodes: true }
  });

  if (!subscriber || subscriber.watchedNodes.length === 0) {
    bot.sendMessage(chatId, 'You are not watching any nodes.');
    return;
  }

  const list = subscriber.watchedNodes.map(n => `• \`${n.nodeIp}\``).join('\n');
  bot.sendMessage(chatId, `👀 *Your Watchlist:*\n${list}`, { parse_mode: 'Markdown' });
});