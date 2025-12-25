// src/components/map/CityNodesModal.tsx
"use client";

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatBytes, formatUptime } from '../../lib/utils';
import { TableCompareButton } from '../TableCompareButton';
import { WatchButton } from '../WatchButton';

interface CityModalProps {
  city: string;
  country: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CityNodesModal({ city, country, isOpen, onClose }: CityModalProps) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && city) {
      setLoading(true);
      fetch(`/api/nodes/city?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`)
        .then(res => res.json())
        .then(data => {
          setNodes(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, city, country]);

  if (!isOpen) return null;

  return (
    // Внешняя подложка: блокирует клики на карту
    <div 
      className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        e.stopPropagation(); // Не даем клику пройти на карту
        onClose(); // Клик по затемнению закрывает окно
      }}
    >
      {/* Само окно */}
      <div 
        className="bg-slate-950 border border-slate-700 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden"
        // Ограничиваем высоту окна, чтобы оно не вылезало за пределы карты
        style={{ maxHeight: '90%' }} 
        onClick={(e) => e.stopPropagation()} // Клик по окну НЕ закрывает его
      >
        
        {/* Хедер (фиксированный) */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {city}
              <span className="text-slate-500 text-sm font-normal">({country})</span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 bg-slate-800 hover:bg-red-900/50 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Контент (скроллится) */}
        <div className="overflow-y-auto p-0 custom-scrollbar grow bg-slate-950">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : nodes.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No active nodes found in this area.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
                <tr className="text-slate-500 text-[10px] uppercase border-b border-slate-800">
                  <th className="p-3 bg-slate-900">Node IP</th>
                  <th className="p-3 bg-slate-900">Ver</th>
                  <th className="p-3 bg-slate-900">Uptime</th>
                  <th className="p-3 bg-slate-900">Score</th>
                  <th className="p-3 bg-slate-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {nodes.map((node) => {
                  const realUptime = node.stats[0]?.uptimeSeconds || 0;
                  return (
                    <tr key={node.id} className="hover:bg-slate-900/80 transition-colors">
                      <td className="p-3">
                        <Link 
                          href={`/node/${encodeURIComponent(node.ipAddress)}`}
                          className="text-blue-400 font-mono text-xs hover:underline block truncate max-w-[120px]"
                          title={node.ipAddress}
                        >
                          {node.ipAddress}
                        </Link>
                      </td>
                      <td className="p-3 text-xs text-slate-400">{node.version}</td>
                      <td className="p-3 text-xs text-slate-400 font-mono">
                         {realUptime > 0 ? formatUptime(realUptime) : '-'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                           <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                             <div 
                               className={`h-full ${node.healthScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                               style={{ width: `${node.healthScore}%` }}
                             />
                           </div>
                           <span className="text-xs font-bold text-slate-300">{node.healthScore}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <WatchButton ip={node.ipAddress} />
                          <TableCompareButton nodeId={node.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}