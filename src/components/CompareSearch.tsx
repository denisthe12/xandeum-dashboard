// src/components/CompareSearch.tsx
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface CompareSearchProps {
  allNodes: { id: string; ipAddress: string }[];
}

export function CompareSearch({ allNodes }: CompareSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState('');

  const handleAdd = () => {
    if (!selectedId) return;

    // Получаем текущие ID из URL
    const currentIds = searchParams.get('ids')?.split(',') || [];
    
    // Если уже есть, не добавляем
    if (currentIds.includes(selectedId)) return;

    // Добавляем новый и обновляем URL
    const newIds = [...currentIds, selectedId];
    const params = new URLSearchParams();
    params.set('ids', newIds.join(','));
    
    router.push(`/compare?${params.toString()}`);
    setSelectedId(''); // Очищаем поле
  };

  return (
    <div className="flex gap-2 max-w-md">
      <div className="relative flex-1">
        <input 
          list="nodes-list"
          placeholder="Type IP to add..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
          onChange={(e) => {
            // Ищем ID по введенному IP
            const node = allNodes.find(n => n.ipAddress === e.target.value);
            if (node) setSelectedId(node.id);
          }}
        />
        {/* Нативный HTML datalist для автокомплита */}
        <datalist id="nodes-list">
          {allNodes.map(node => (
            <option key={node.id} value={node.ipAddress} />
          ))}
        </datalist>
      </div>
      <button 
        onClick={handleAdd}
        disabled={!selectedId}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add
      </button>
    </div>
  );
}