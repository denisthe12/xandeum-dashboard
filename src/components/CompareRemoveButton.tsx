// src/components/CompareRemoveButton.tsx
"use client";

import { X } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useRouter } from 'next/navigation';

export function CompareRemoveButton({ nodeId }: { nodeId: string }) {
  const { removeFromCompare, selectedIds } = useCompare();
  const router = useRouter();

  const handleRemove = () => {
    // 1. Удаляем из контекста (LS)
    removeFromCompare(nodeId);
    
    // 2. Обновляем URL (убираем ID из списка)
    const newIds = selectedIds.filter(id => id !== nodeId);
    if (newIds.length > 0) {
      router.push(`/compare?ids=${newIds.join(',')}`);
    } else {
      router.push('/compare');
    }
  };

  return (
    <button 
      onClick={handleRemove}
      className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-slate-800"
      title="Remove from view"
    >
      <X className="h-5 w-5" />
    </button>
  );
}