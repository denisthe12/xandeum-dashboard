// app/node/[ip]/page.tsx

import { getNodeDetail } from '../../../src/services/nodes';
import { formatBytes, formatUptime, formatNumber, formatCredits } from '../../../src/lib/utils';
import { ResourcesChart, StorageHistoryChart } from '../../../src/components/charts/NodeCharts';
import { CopyButton } from '../../../src/components/CopyButton'; // Импорт кнопки копирования
import { RefreshButton } from '../../../src/components/RefreshButton'; // Импорт кнопки обновления
import Link from 'next/link';
import { ArrowLeft, Server, Shield, Clock, Database, MapPin, Activity, Layers, Lock, Globe, Coins } from 'lucide-react';

export default async function NodeDetailPage({ params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  const rawIp = resolvedParams.ip || resolvedParams.id || resolvedParams.slug;

  if (!rawIp) return <div className="p-8 text-red-500">Error: No IP specified.</div>;

  const ip = decodeURIComponent(rawIp);
  const node = await getNodeDetail(ip);

  if (!node) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Node Not Found</h1>
          <Link href="/nodes" className="text-blue-400 hover:underline">Return to list</Link>
        </div>
      </div>
    );
  }

  const latestStat = node.stats.length > 0 ? node.stats[node.stats.length - 1] : null;
  const systemUptime = latestStat?.uptimeSeconds || node.gossipUptime || 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Хедер навигации и кнопка Refresh */}
        <div className="flex justify-end items-center">
          
          {/* Кнопка обновления доступна только для Public нод, так как к Private мы не подключимся */}
          {node.isRpcActive && <RefreshButton ips={[node.ipAddress]} />}
        </div>

        {/* Главный блок информации */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            
            {/* Левая часть: Имя, Статус, Гео */}
            <div className="flex items-start gap-4">
              <div className={`h-16 w-16 rounded-xl flex items-center justify-center shrink-0 ${
                node.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                <Server className="h-8 w-8" />
              </div>
              
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-mono font-bold break-all">{node.ipAddress}</h1>
                  {/* Бейдж Public/Private */}
                  <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${
                    node.isRpcActive 
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    {node.isRpcActive ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {node.isRpcActive ? 'Public RPC' : 'Private Gossip'}
                  </span>
                  {/* Credits Badge (New) */}
                  <span className="text-xs px-2 py-1 rounded-md border border-yellow-500/20 bg-yellow-500/10 text-yellow-500 flex items-center gap-1.5 font-bold">
                    <Coins className="h-3 w-3" />
                    {formatCredits(node.credits)} Credits
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400 mt-2 text-sm flex-wrap">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{node.city}, {node.country}</span>
                  <span className="text-slate-600 mx-2">•</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">v{node.version}</span>
                  <span className="text-slate-600 mx-2">•</span>
                  <span>{node.isp}</span>
                </div>
              </div>
            </div>

            {/* Правая часть: Ключи и Копирование */}
            <div className="flex flex-col gap-2 justify-center lg:items-end w-full lg:w-auto">
               <div className="flex items-center justify-between lg:justify-end gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800 w-full lg:w-auto">
                  <span className="text-[10px] text-slate-500 uppercase font-bold px-1">IP</span>
                  <span className="font-mono text-sm text-slate-300 truncate">{node.ipAddress}</span>
                  <CopyButton text={node.ipAddress} />
               </div>
               
               {node.pubkey && (
                 <div className="flex items-center justify-between lg:justify-end gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800 w-full lg:w-auto">
                    <span className="text-[10px] text-slate-500 uppercase font-bold px-1">KEY</span>
                    <span className="font-mono text-xs text-slate-300 truncate max-w-[200px]" title={node.pubkey}>
                      {node.pubkey}
                    </span>
                    <CopyButton text={node.pubkey} />
                 </div>
               )}
            </div>

          </div>
        </div>

        {/* Метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricBox 
            label="Total Storage (Used / Total)" 
            value={formatBytes(node.usedStorageBytes)} 
            subValue={`of ${formatBytes(node.currentStorageBytes)} committed`}
            icon={<Database className="text-purple-400" />}
          />
          <MetricBox 
            label="Block Height" 
            value={node.blockHeight.toLocaleString()} 
            icon={<Layers className="text-blue-400" />}
          />
          <MetricBox 
            label="Network Traffic" 
            value={`↓ ${formatNumber(node.currentPacketsIn)}`} 
            subValue={`↑ ${formatNumber(node.currentPacketsOut)}`}
            icon={<Activity className="text-orange-400" />}
          />
          <MetricBox 
            label="System Uptime" 
            value={node.isActive && systemUptime > 0 ? formatUptime(systemUptime) : '-'} 
            icon={<Clock className="text-green-400" />}
          />

        </div>

        {/* Графики */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-[400px]">
            <h3 className="text-lg font-semibold mb-6">System Resources</h3>
            {/* Показываем график только если есть данные, иначе заглушка */}
            {node.stats.length > 0 && node.stats[0].cpuPercent > 0 ? (
               <ResourcesChart data={node.stats} />
            ) : (
               <div className="h-full flex items-center justify-center text-slate-500">
                 No CPU/RAM metrics available (Private Node)
               </div>
            )}
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-[400px]">
            <h3 className="text-lg font-semibold mb-6">Storage Growth</h3>
            <StorageHistoryChart data={node.stats} />
          </div>
        </div>

        {/* История доступности */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="flex gap-1 h-8 w-full">
            {node.stats.slice(-60).map((stat) => {
              const lat = stat.latencyMs || 0;
              return (
                <div 
                  key={stat.id} 
                  className={`flex-1 rounded-sm ${lat < 200 ? 'bg-green-500' : 'bg-yellow-500'}`}
                  title={`${new Date(stat.recordedAt).toLocaleTimeString()} - ${lat}ms`}
                />
              );
            })}
            {Array.from({ length: Math.max(0, 60 - node.stats.length) }).map((_, i) => (
              <div key={i} className="flex-1 bg-slate-800/50 rounded-sm" />
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

function MetricBox({ label, value, subValue, icon }: any) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
      <div className="p-3 bg-slate-800 rounded-lg">{icon}</div>
      <div>
        <div className="text-slate-400 text-sm">{label}</div>
        <div className="text-xl font-bold text-slate-200">{value}</div>
        {subValue && <div className="text-[14px] text-slate-500 mt-1">{subValue}</div>}
      </div>
    </div>
  );
}