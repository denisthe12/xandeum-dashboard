// src/components/TableCompareButton.tsx
"use client";

import { GitCompare, Check, X } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useState } from 'react';

export function TableCompareButton({ nodeId }: { nodeId: string }) {
  const { addToCompare, removeFromCompare, selectedIds } = useCompare();
  const [isHovered, setIsHovered] = useState(false);

  const isAdded = selectedIds.includes(nodeId);

  const handleClick = () => {
    if (isAdded) {
      removeFromCompare(nodeId);
    } else {
      addToCompare(nodeId);
    }
  };

  return (
    <button
      onClick={handleClick}
      // Убрали disabled!
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={isAdded ? "Remove from compare" : "Add to compare"}
      className={`p-2 rounded-lg transition-all group ${
        isAdded 
          ? 'bg-blue-600/20 text-blue-400 hover:bg-red-900/30 hover:text-red-400' 
          : 'bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white'
      }`}
    >
      {isAdded ? (
        // При наведении показываем крестик (удалить), иначе галочку
        isHovered ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />
      ) : (
        <GitCompare className="h-4 w-4" />
      )}
    </button>
  );
}