// src/context/AlertsContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface AlertsContextType {
  connectCode: string;
  watchedIps: string[];
  isBotConnected: boolean;
  toggleWatch: (ip: string) => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [connectCode, setConnectCode] = useState('');
  const [watchedIps, setWatchedIps] = useState<string[]>([]);
  const [isBotConnected, setIsBotConnected] = useState(false);

  // 1. При загрузке генерируем код или берем из LS
  useEffect(() => {
    let code = localStorage.getItem('xandeum_alert_code');
    if (!code) {
      // Генерируем случайный 6-значный код
      code = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem('xandeum_alert_code', code);
    }
    setConnectCode(code);
    
    // Синхронизируем с сервером
    syncWithServer(code, '', 'get');
  }, []);

  const syncWithServer = async (code: string, ip: string, action: 'add' | 'remove' | 'get') => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ip, action })
      });
      const data = await res.json();
      if (data.success) {
        setWatchedIps(data.watched);
        setIsBotConnected(data.isConnected);
      }
    } catch (e) {
      console.error('Sync failed');
    }
  };

  const toggleWatch = (ip: string) => {
    const isWatched = watchedIps.includes(ip);
    const action = isWatched ? 'remove' : 'add';
    
    // Оптимистичное обновление UI
    if (isWatched) {
      setWatchedIps(prev => prev.filter(i => i !== ip));
      toast.info('Node removed from watchlist');
    } else {
      setWatchedIps(prev => [...prev, ip]);
      toast.success('Node added to watchlist');
    }

    syncWithServer(connectCode, ip, action);
  };

  return (
    <AlertsContext.Provider value={{ connectCode, watchedIps, isBotConnected, toggleWatch }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (context === undefined) throw new Error('useAlerts must be used within AlertsProvider');
  return context;
}