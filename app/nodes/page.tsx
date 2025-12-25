// app/nodes/page.tsx

import { getNodes, getFilterOptions } from '../../src/services/nodes';
import { formatBytes, formatUptime, formatNumber, formatCredits, formatPubKey } from '../../src/lib/utils';
import { NodeFilters } from '../../src/components/NodeFilters';
import { TableCompareButton } from '../../src/components/TableCompareButton';
import { WatchButton } from '../../src/components/WatchButton';
import { Pagination } from '../../src/components/Pagination';
import Link from 'next/link';
import { ArrowDown, ArrowUp, Globe, Lock, ChevronsUpDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface NodesPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

let currentParams: any = {};

function SortableHeader({ label, sortKey, currentSort, currentOrder, className = "" }: any) {
  const isSorted = currentSort === sortKey;
  const nextOrder = isSorted && currentOrder === 'desc' ? 'asc' : 'desc';
  
  return (
    <th className={`p-3 font-medium cursor-pointer hover:text-white transition-colors group select-none whitespace-nowrap ${className}`}>
      <Link 
        href={{ query: { ...currentParams, sort: sortKey, order: nextOrder } }}
        className="flex items-center gap-1"
      >
        {label}
        <span className="text-slate-600 group-hover:text-slate-400">
          {isSorted ? (
            currentOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-blue-400" /> : <ArrowUp className="h-3 w-3 text-blue-400" />
          ) : (
            <ChevronsUpDown className="h-3 w-3" />
          )}
        </span>
      </Link>
    </th>
  );
}

export default async function NodesPage({ searchParams }: NodesPageProps) {
  const params = await searchParams;
  currentParams = params;

  const page = Number(params.page) || 1;
  const pageSize = 20;

  const filter = {
    query: params.q,
    status: params.status || 'all',
    country: params.country,
    version: params.version,
    type: params.type,
    sort: params.sort,
    order: params.order as 'asc' | 'desc',
    page, 
    pageSize
  };

  const [{ nodes, total }, options] = await Promise.all([
    getNodes(filter),
    getFilterOptions()
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Хедер с Пагинацией */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">Network Explorer</h1>
          
          {/* Пагинация здесь! */}
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>

        <NodeFilters countries={options.countries} versions={options.versions} />

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          
          {/* Убрали верхнюю панель из таблицы, теперь таблица начинается сразу */}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap">
                  <SortableHeader label="Rank" sortKey="rank" currentSort={params.sort} currentOrder={params.order} className="w-12" />
                  <th className="p-3 font-medium min-w-[200px]">Node</th>
                  <th className="p-3 font-medium w-24">PubKey</th>
                  <SortableHeader label="Credits" sortKey="credits" currentSort={params.sort} currentOrder={params.order} className="w-24" />
                  <th className="p-3 font-medium w-20">Ver</th>
                  <SortableHeader label="Height" sortKey="height" currentSort={params.sort} currentOrder={params.order} className="w-20" />
                  <SortableHeader label="Storage" sortKey="storage" currentSort={params.sort} currentOrder={params.order} className="w-32" />
                  <th className="p-3 font-medium w-32">Network</th>
                  <SortableHeader label="Uptime" sortKey="uptime" currentSort={params.sort} currentOrder={params.order} className="w-24" />
                  <SortableHeader label="Score" sortKey="score" currentSort={params.sort} currentOrder={params.order} className="w-32" />
                  <th className="p-3 font-medium w-10"></th>
                  <th className="p-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {nodes.map((node, index) => {
                  const realUptime = node.stats[0]?.uptimeSeconds || node.gossipUptime || 0;
                  const rank = (page - 1) * pageSize + index + 1;
                  
                  return (
                    <tr key={node.id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="p-3 text-slate-500 font-mono text-sm">#{rank}</td>
                      
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${node.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                          <div>
                            <Link 
                              href={`/node/${encodeURIComponent(node.ipAddress)}`} 
                              className="font-mono text-sm text-blue-400 hover:text-blue-300 hover:underline block whitespace-nowrap"
                            >
                              {node.ipAddress}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                               <span className="text-xs text-slate-500 flex items-center gap-1">
                                 {node.country}
                               </span>
                               {node.isRpcActive ? 
                                 <Globe className="h-3 w-3 text-blue-500/50" /> : 
                                 <Lock className="h-3 w-3 text-slate-600" />
                               }
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-xs font-mono text-slate-500">
                         {formatPubKey(node.pubkey)}
                      </td>

                      <td className="p-3 text-sm font-bold text-yellow-500/80">
                        {node.credits > 0 ? formatCredits(node.credits) : '-'}
                      </td>

                      <td className="p-3 text-sm">
                        <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-400 border border-slate-700 whitespace-nowrap">
                          {node.version || 'v?'}
                        </span>
                      </td>

                      <td className="p-3 text-sm font-mono text-slate-300">
                        {node.blockHeight > 0 ? node.blockHeight.toLocaleString() : '-'}
                      </td>

                      <td className="p-3 text-sm font-bold text-slate-200 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-blue-400">{formatBytes(node.usedStorageBytes)}</span>
                          <span className="text-[12px] text-slate-500 font-normal">of {formatBytes(node.currentStorageBytes)}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col text-xs font-mono whitespace-nowrap">
                          <div className="flex items-center gap-1 text-slate-400">
                            <ArrowDown className="h-3 w-3" /> {formatNumber(node.currentPacketsIn)}
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <ArrowUp className="h-3 w-3" /> {formatNumber(node.currentPacketsOut)}
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-sm font-mono text-slate-400 whitespace-nowrap">
                        {node.isActive && realUptime > 0 ? formatUptime(realUptime) : '-'}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${node.healthScore >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                              style={{ width: `${node.healthScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-300">{node.healthScore}</span>
                        </div>
                      </td>

                      <td className="p-3 text-right whitespace-nowrap">
                         <div className="flex justify-end gap-1">
                            <WatchButton ip={node.ipAddress} />
                            <TableCompareButton nodeId={node.id} />
                         </div>
                      </td>
                    </tr>
                  );
                })}
                
                {nodes.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-500">No nodes found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-800 flex justify-center">
             <Pagination currentPage={page} totalPages={totalPages} />
          </div>

        </div>
      </div>
    </main>
  );
}