// src/lib/rpc-client.ts

import axios, { AxiosInstance } from 'axios';

// === Интерфейсы ===

// Ответ get-version
interface VersionResult {
  version: string;
}

// Ответ get-stats (Детальная статистика одной ноды)
interface StatsResult {
  metadata: {
    total_bytes: number;
    total_pages: number;
    last_updated: number;
  };
  stats: {
    cpu_percent: number;
    ram_used: number;
    ram_total: number;
    uptime: number;
    packets_received: number;
    packets_sent: number;
    active_streams: number;
  };
  file_size: number;
  current_index: number;
}

// Ответ get-pods-with-stats (Элемент списка)
export interface PodStats {
  address: string;           // "109.199.96.218:9001"
  is_public: boolean;
  last_seen_timestamp: number;
  pubkey: string | null;
  rpc_port: number;
  storage_committed: number;
  storage_usage_percent: number;
  storage_used: number;
  uptime: number;
  version: string;
}

// Обертка для списка
interface PodsWithStatsResult {
  pods: PodStats[];
}

// Старый get-pods
interface PodsResult {
  pods: { address: string }[];
}

export class PNodeRpcClient {
  private httpClient: AxiosInstance;

  constructor(baseURL: string) {
    this.httpClient = axios.create({
      baseURL,
      timeout: 10000, 
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async sendRequest<T>(method: string, params: any = null): Promise<T | null> {
    try {
      const payload = {
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
      };

      const response = await this.httpClient.post('', payload);
      const data = response.data;

      if (data.error) {
        return null;
      }

      return data.result || null;
    } catch (error) {
      return null;
    }
  }

  // === Методы API ===

  // 1. Получить версию
  async getVersion(): Promise<string | null> {
    const result = await this.sendRequest<VersionResult>('get-version');
    return result ? result.version : null;
  }

  // 2. Получить полную статистику (CPU, RAM) - ТОТ САМЫЙ МЕТОД, КОТОРЫЙ ПРОПАЛ
  async getStats(): Promise<StatsResult | null> {
    return await this.sendRequest<StatsResult>('get-stats');
  }

  // 3. Получить список всех нод со статистикой (Gossip)
  async getPodsWithStats(): Promise<PodStats[]> {
    const result = await this.sendRequest<PodsWithStatsResult>('get-pods-with-stats');
    return result ? result.pods : [];
  }

  // 4. Старый метод (на всякий случай)
  async getPods(): Promise<{ address: string }[]> {
    const result = await this.sendRequest<PodsResult>('get-pods');
    return result ? result.pods : [];
  }
}