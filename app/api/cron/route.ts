// app/api/cron/route.ts
import { NextResponse } from 'next/server';
import { runCrawler } from '../../../src/services/crawler';

// Эта настройка разрешает выполнение до 60 секунд (максимум для Hobby плана)
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Простая защита, чтобы кто попало не запускал краулер
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log("⏰ Cron started...");
    await runCrawler(); // Запускаем один цикл обновления
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cron failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}