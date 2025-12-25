// src/components/RefreshButton.tsx
"use client";

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function RefreshButton({ ips }: { ips: string[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ips })
      });
      router.refresh(); // Обновляем данные на странице Next.js
      toast.success('Metrics updated');
    } catch (e) {
      toast.error('Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRefresh}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50 text-slate-200 hover:text-white"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      Refresh Data
    </button>
  );
}