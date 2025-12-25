"use client";
import { Eye, EyeOff } from 'lucide-react';
import { useAlerts } from '../context/AlertsContext';

export function WatchButton({ ip }: { ip: string }) {
  const { watchedIps, toggleWatch } = useAlerts();
  const isWatched = watchedIps.includes(ip);

  return (
    <button
      onClick={() => toggleWatch(ip)}
      className={`p-2 rounded-lg transition-colors ${
        isWatched ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
      }`}
      title={isWatched ? "Stop watching" : "Watch this node"}
    >
      {isWatched ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  );
}