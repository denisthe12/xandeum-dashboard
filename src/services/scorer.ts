// src/services/scorer.ts

// Актуальная версия сети (мы видели её в логах). 
// В будущем это можно вынести в конфиг или определять автоматически.
const CURRENT_TARGET_VERSION = '0.8.0';

interface ScorerInput {
  cpuPercent: number;
  uptimeSeconds: number;
  latencyMs: number;
  version: string;
  totalFiles: number;
}

export function calculateHealthScore(data: ScorerInput): number {
  let score = 0;

  // 1. Uptime (30 баллов)
  // Т.к. мы не знаем uptime % (мы только начали следить), 
  // будем считать ноду надежной, если процесс запущен более 24 часов (86400 сек).
  if (data.uptimeSeconds > 86400) {
    score += 30;
  } else if (data.uptimeSeconds > 3600) {
    // Если больше часа - даем половину
    score += 15;
  }

  // 2. Latest Version (20 баллов)
  // Сравниваем версию ноды с целевой
  if (data.version === CURRENT_TARGET_VERSION) {
    score += 20;
  }

  // 3. CPU Load < 80% (20 баллов)
  // Если CPU меньше 80%, значит ноде легко
  if (data.cpuPercent < 80) {
    score += 20;
  }

  // 4. Response Time < 200ms (15 баллов)
  // Быстрый отклик
  if (data.latencyMs < 200) {
    score += 15;
  } else if (data.latencyMs < 500) {
    score += 10; // Утешительные баллы
  }

  // 5. Storage Available / Active (15 баллов)
  // Если нода реально хранит какие-то файлы (pages > 0), значит она полезна
  if (data.totalFiles > 0) {
    score += 15;
  }

  return score;
}