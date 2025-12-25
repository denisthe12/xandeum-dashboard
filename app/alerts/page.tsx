// app/alerts/page.tsx
"use client";

import { useAlerts } from '../../src/context/AlertsContext';
import { Copy, Check, Bell } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AlertsPage() {
  const { connectCode, watchedIps, isBotConnected } = useAlerts();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(`/start ${connectCode}`);
    setCopied(true);
    toast.success('Command copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="text-yellow-400" /> Alerts Center
        </h1>

        {/* Блок подключения */}
        <div className={`p-6 rounded-xl border ${isBotConnected ? 'bg-green-900/20 border-green-800' : 'bg-slate-900/50 border-slate-800'}`}>
          <h2 className="text-xl font-bold mb-4">
            {isBotConnected ? '✅ Telegram Connected' : '🤖 Connect Telegram Bot'}
          </h2>
          
          {!isBotConnected && (
            <>
              <p className="text-slate-400 mb-4">
                To receive alerts, copy the command below and send it to our bot.
              </p>
              <div className="flex gap-2">
                <code className="bg-black px-4 py-3 rounded-lg font-mono text-blue-400 flex-1">
                  /start {connectCode}
                </code>
                <button 
                  onClick={copyCode}
                  className="bg-blue-600 hover:bg-blue-500 px-4 rounded-lg font-bold transition-colors"
                >
                  {copied ? <Check /> : <Copy />}
                </button>
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Bot Link: <a href="https://t.me/xandeum_node_bot" target="_blank" className="text-blue-400 underline">@xandeum_node_bot</a>
              </div>
            </>
          )}
        </div>

        {/* Список отслеживаемого */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
           <h2 className="text-xl font-bold mb-4">Your Watchlist ({watchedIps.length})</h2>
           {watchedIps.length === 0 ? (
             <p className="text-slate-500">You are not watching any nodes yet.</p>
           ) : (
             <ul className="space-y-2">
               {watchedIps.map(ip => (
                 <li key={ip} className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                   {/* Ссылка на страницу ноды */}
                   <Link 
                     href={`/node/${encodeURIComponent(ip)}`}
                     className="font-mono text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                   >
                     {ip}
                   </Link>
                   
                   <span className="text-xs text-green-500 bg-green-900/30 px-2 py-1 rounded flex items-center gap-1">
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                     </span>
                     Monitoring
                   </span>
                 </li>
               ))}
             </ul>
           )}
        </div>
      </div>
    </main>
  );
}