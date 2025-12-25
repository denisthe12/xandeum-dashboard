// app/page.tsx

import { getNetworkSummary, getNetworkGrowth, getMapData, getProviderDistribution } from '../src/services/analytics';
import { formatBytes } from '../src/lib/utils';
import { Activity, HardDrive, Server, Globe2, Network } from 'lucide-react';
import { NetworkGrowthChart } from '../src/components/charts/NetworkGrowthChart';
import { ProviderChart } from '../src/components/charts/ProviderChart';
import { WorldMap } from '../src/components/map/WorldMap';
import { LiveActivityFeed } from '../src/components/LiveActivityFeed';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [summary, growthData, mapData, providersData] = await Promise.all([
    getNetworkSummary(),
    getNetworkGrowth(),
    getMapData(),
    getProviderDistribution()
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-[1600px] mx-auto space-y-6"> {/* Уменьшили отступы между блоками */}
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Xandeum Explorer
            </h1>
            <p className="text-slate-400 mt-1">
              Live monitoring of the storage network
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Network Online
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Nodes (Active / Total)" 
            value={`${summary.totalActiveNodes} / ${summary.totalDiscoveredNodes}`} 
            icon={<Server className="h-5 w-5 text-blue-400" />}
            subtext="Gossip Active / Discovered"
          />
          <StatCard 
            title="Storage (Active / Total)" 
            value={`${formatBytes(summary.storageActive)} / ${formatBytes(summary.storageAll)}`}
            icon={<HardDrive className="h-5 w-5 text-purple-400" />}
            subtext="Committed Capacity"
          />
          <StatCard 
            title="Avg Latency" 
            value={`${summary.averageLatencyMs} ms`} 
            icon={<Activity className="h-5 w-5 text-green-400" />}
            subtext="Public RPC Response"
          />
          <StatCard 
            title="Countries" 
            value={`${summary.countriesActiveCount} / ${summary.countriesAllCount}`} 
            icon={<Globe2 className="h-5 w-5 text-orange-400" />}
            subtext="Active / Total Regions"
          />
        </div>

        {/* === НОВАЯ СЕТКА: КАРТА + ЛЕНТА === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Карта занимает 2 колонки */}
           <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                 <Globe2 className="h-4 w-4 text-slate-400" />
                 Global Distribution
               </h3>
              <WorldMap data={mapData} />
           </div>

           {/* Лента занимает 1 колонку и подстраивается по высоте */}
           <div className="h-[385px] pt-10"> {/* Высота под карту + заголовок */}
              <LiveActivityFeed />
           </div>
        </div>

        {/* === ГРАФИКИ === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-[300px]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-400" />
              Network Growth
            </h3>
            <div className="h-[220px] w-full">
              <NetworkGrowthChart data={growthData} />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-[300px]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Network className="h-4 w-4 text-slate-400" />
              ISP Decentralization
            </h3>
            <div className="h-[220px] w-full">
              <ProviderChart data={providersData} />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

function StatCard({ title, value, icon, subtext }: any) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl hover:bg-slate-900/80 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
      </div>
      <div className="text-lg font-bold text-slate-100">{value}</div>
      <p className="text-xs text-slate-500 mt-1">{subtext}</p>
    </div>
  );
}