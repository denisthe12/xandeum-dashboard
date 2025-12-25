// src/context/CompareContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CompareContextType {
  selectedIds: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 1. Загрузка из LocalStorage при старте
  useEffect(() => {
    const saved = localStorage.getItem('xandeum_compare_ids');
    if (saved) {
      try {
        setSelectedIds(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse compare ids');
      }
    }
  }, []);

  // 2. Сохранение в LocalStorage при изменениях
  useEffect(() => {
    localStorage.setItem('xandeum_compare_ids', JSON.stringify(selectedIds));
  }, [selectedIds]);

  const addToCompare = (id: string) => {
    if (selectedIds.includes(id)) {
      toast.warning('This node is already in your compare list');
      return;
    }
    if (selectedIds.length >= 3) {
      toast.error('You can compare up to 3 nodes at a time');
      return;
    }
    
    setSelectedIds((prev) => [...prev, id]);
    toast.success('Node added to comparison');
  };

  const removeFromCompare = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const clearCompare = () => {
    setSelectedIds([]);
  };

  return (
    <CompareContext.Provider value={{ selectedIds, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}