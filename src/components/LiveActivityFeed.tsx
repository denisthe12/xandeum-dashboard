// src/components/LiveActivityFeed.tsx
"use client";

import { useEffect, useState } from 'react';
import { Activity, Radio, ArrowUpCircle, AlertCircle, PlusCircle, CheckCircle2 } from 'lucide-react';

interface LogItem {
  id: string;
  type: string;
  message: string;
  nodeIp: string;
  country: string;
  createdAt: string;
}

export function LiveActivityFeed() {
  const [logs, setLogs] = useState<LogItem[]>([]);

  useEffect(() => {
    // Функция загрузки
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/activity');
        const data = await res.json();
        setLogs(data);
      } catch (e) {
        // ignore error
      }
    };

    fetchLogs(); // Первый запуск
    
    // Повторяем каждые 5 секунд
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Radio className="h-4 w-4 text-red-500 animate-pulse" />
        Live Network Activity
      </h3>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 max-h-[300px]">
        {logs.length === 0 ? (
          <p className="text-slate-500 text-sm">Waiting for network events...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
              <div className="mt-1">
                {getIcon(log.type)}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">
                  {log.message}
                </div>
                <div className="text-xs text-slate-500 flex gap-2 mt-0.5">
                  <span className="font-mono text-blue-400">{log.nodeIp}</span>
                  <span>•</span>
                  <span>{log.country || 'Unknown'}</span>
                  <span>•</span>
                  <span>{formatTime(log.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getIcon(type: string) {
  switch (type) {
    case 'NEW_NODE': return <PlusCircle className="h-4 w-4 text-blue-400" />;
    case 'ONLINE': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
    case 'OFFLINE': return <AlertCircle className="h-4 w-4 text-red-400" />;
    case 'UPDATE': return <ArrowUpCircle className="h-4 w-4 text-purple-400" />;
    default: return <Activity className="h-4 w-4 text-slate-400" />;
  }
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}