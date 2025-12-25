// app/compare/page.tsx

import { getNodesByIds, getAllActiveIPs } from '../../src/services/nodes';
import { formatBytes, formatUptime, formatCredits, formatNumber } from '../../src/lib/utils'; // <--- Добавили formatNumber
import { CompareSearch } from '../../src/components/CompareSearch';
import { CompareRemoveButton } from '../../src/components/CompareRemoveButton';
import { RefreshButton } from '../../src/components/RefreshButton';
import { Cpu, HardDrive, Activity, Trophy, Globe, Lock, Coins, ArrowDown, ArrowUp } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const ids = params.ids ? params.ids.split(',') : [];

  const [nodes, allActiveNodes] = await Promise.all([
    getNodesByIds(ids),
    getAllActiveIPs()
  ]);

  const publicIps = nodes.filter(n => n.isRpcActive).map(n => n.ipAddress);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Compare Nodes</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {publicIps.length > 0 && <RefreshButton ips={publicIps} />}
             <CompareSearch allNodes={allActiveNodes} />
          </div>
        </div>

        {nodes.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            <h3 className="text-xl text-slate-400 font-medium">No nodes selected</h3>
            <p className="text-slate-500 mt-2">Use the search bar above to add nodes for comparison</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse bg-slate-900/50 rounded-xl overflow-hidden shadow-xl border border-slate-800">
              <thead>
                <tr>
                  <th className="p-6 bg-slate-900 w-48 text-slate-500 font-medium border-b border-r border-slate-800">Metric</th>
                  {nodes.map(node => (
                    <th key={node.id} className="p-6 min-w-[250px] border-b border-r border-slate-800 bg-slate-900/80 relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-lg font-mono font-bold text-blue-400">{node.ipAddress}</div>
                          <div className="text-sm text-slate-400">{node.city}, {node.country}</div>
                          
                          <div className="mt-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${
                              node.isRpcActive 
                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}>
                              {node.isRpcActive ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                              {node.isRpcActive ? 'Public' : 'Private'}
                            </span>
                          </div>
                        </div>
                        <CompareRemoveButton nodeId={node.id} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                
                {/* 1. Health Score */}
                <tr>
                  <td className="p-6 bg-slate-900/50 border-r border-slate-800 font-medium text-slate-400 flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> Health Score
                  </td>
                  {nodes.map(node => (
                    <td key={node.id} className="p-6 border-r border-slate-800 bg-slate-900/20">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${
                           node.healthScore >= 80 ? 'text-green-400' :
                           node.healthScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {node.healthScore}
                        </span>
                        <span className="text-slate-500 text-sm">/ 100</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 2. Credits (НОВАЯ СТРОКА) */}
                <tr>
                  <td className="p-6 bg-slate-900/50 border-r border-slate-800 font-medium text-slate-400 flex items-center gap-2">
                    <Coins className="h-4 w-4" /> Pod Credits
                  </td>
                  {nodes.map(node => (
                    <td key={node.id} className="p-6 border-r border-slate-800 font-bold text-yellow-400">
                      {formatCredits(node.credits)}
                    </td>
                  ))}
                </tr>

                {/* 3. Version */}
                <tr>
                  <td className="p-6 bg-slate-900/50 border-r border-slate-800 font-medium text-slate-400">Software Version</td>
                  {nodes.map(node => (
                    <td key={node.id} className="p-6 border-r border-slate-800">
                      <span className="bg-slate-800 px-3 py-1 rounded-full text-sm border border-slate-700">
                        {node.version}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 4. Uptime */}
                <tr>
                  <td className="p-6 bg-slate-900/50 border-r border-slate-800 font-medium text-slate-400">System Uptime</td>
                  {nodes.map(node => (
                    <td key={node.id} className="p-6 border-r border-slate-800 font-mono text-slate-300">
                       {node.stats[0] ? formatUptime(node.stats[0].uptimeSeconds) : '-'}
                    </td>
                  ))}
                </tr>

                {/* 5. CPU Usage */}
                <tr>
                  <td className="p-6 bg-slate-900/50 border-r border-slate-800 font-medium text-slate-400 flex items-center gap-2">
                    <Cpu className="h-4 w-4" /> CPU Load
                  </td>
                  {nodes.map(node => (
                    <td key={node.id} className="p-6 border-r border-slate-800">
                      {node.isRpcActive && node.stats[0] ? (
                        <div className="w-full bg-slate-800 h-2 rounded-full mt-2 relative">
                          <div 
                            className="bg-blue-500 h-2 rounded-full absolute top-0 left-0" 
                            style={{ width: `${Math.min(node.stats[0].cpuPercent, 100)}%` }}
                          />
                          <span className="absolute -top-6 right-0 text-sm font-mono text-slate-300">
                            {node.stats[0].cpuPercent.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Private node</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 6. RAM Usage */}
                <tr>
                  <td className="p-6 bg-slate-900/50 border-r border-slate-800 font-medium text-slate-400 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> RAM Used
                  </td>
                  {nodes.map(node => (
                    <td key={node.id} className="p-6 border-r border-slate-800 font-mono text-slate-300">
                      {node.isRpcActive && node.stats[0] ? (
                        <>
                          {formatBytes(node.stats[0].ramUsedBytes)}
                          <span className="text-slate-500 text-xs ml-2">
                             / {formatBytes(node.stats[0].ramTotalBytes)}
                          </span>
                        </>
                      ) : '-'}
                    </td>
                  ))}
                </tr>

                {/* 7. Storage */}
                <tr>
                  <td className="p-6 bg-slate-900/50 border-r border-slate-800 font-medium text-slate-400 flex items-center gap-2">
                    <HardDrive className="h-4 w-4" /> Storage (Used)
                  </td>
                  {nodes.map(node => (
                    <td key={node.id} className="p-6 border-r border-slate-800">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200">{formatBytes(node.usedStorageBytes)}</span>
                        <span className="text-xs text-slate-500">of {formatBytes(node.currentStorageBytes)}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 8. Packets IN (НОВАЯ СТРОКА) */}
                <tr>
                  <td className="p-6 bg-slate-900/50 border-r border-slate-800 font-medium text-slate-400 flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-green-400" /> Packets In
                  </td>
                  {nodes.map(node => (
                    <td key={node.id} className="p-6 border-r border-slate-800 font-mono text-slate-300">
                      {node.currentPacketsIn > 0 ? formatNumber(node.currentPacketsIn) : '-'}
                    </td>
                  ))}
                </tr>

                {/* 9. Packets OUT (НОВАЯ СТРОКА) */}
                <tr>
                  <td className="p-6 bg-slate-900/50 border-r border-slate-800 font-medium text-slate-400 flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-blue-400" /> Packets Out
                  </td>
                  {nodes.map(node => (
                    <td key={node.id} className="p-6 border-r border-slate-800 font-mono text-slate-300">
                      {node.currentPacketsOut > 0 ? formatNumber(node.currentPacketsOut) : '-'}
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}