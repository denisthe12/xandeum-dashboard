// scripts/run-crawler.ts

require('dotenv').config();
import { runCrawler } from '../src/services/crawler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Интервал: 5 минут
const INTERVAL_MS = 15 * 1000;

async function startDaemon() {
  console.log('⏰ Crawler Daemon started.');
  console.log('Press Ctrl+C to stop.');

  // Бесконечный цикл
  while (true) {
    try {
      // 1. Запускаем сканирование
      await runCrawler();
      
      console.log(`💤 Sleeping for ${INTERVAL_MS / 1000} seconds...`);
    } catch (error) {
      console.error('🔥 Crawler crashed:', error);
      // Если упал, ждем минуту и пробуем снова
      await new Promise(resolve => setTimeout(resolve, 60000));
    }

    // 2. Ждем 5 минут перед следующим запуском
    await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
  }
}

// Обработка выхода (Ctrl+C)
process.on('SIGINT', async () => {
  console.log('\n🛑 Stopping Daemon...');
  await prisma.$disconnect();
  process.exit(0);
});

startDaemon();