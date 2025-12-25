// src/components/NodeFilters.tsx
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

interface NodeFiltersProps {
  countries: string[];
  versions: string[];
}

export function NodeFilters({ countries, versions }: NodeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`/nodes?${params.toString()}`);
  };

  // Общий стиль для селектов: pr-8 (padding-right) отодвигает текст от стрелки
  const selectClass = "bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none";
  
  // Обертка для селекта, чтобы добавить кастомную стрелочку (опционально), 
  // но стандартный appearance-none + pr-8 обычно решает проблему наезжания.
  // В данном случае оставим стандартную стрелку браузера, но дадим ей место через pr-8.
  
  // Лучший вариант для Tailwind: использовать grid или flex для позиционирования
  const wrapSelect = (child: React.ReactNode) => (
    <div className="relative">
      {child}
      {/* Кастомная стрелочка, если стандартная не нравится (потребует appearance-none у select) */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
      
      {/* Поиск */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search by IP..." 
          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          onChange={(e) => updateFilter('q', e.target.value)}
          defaultValue={searchParams.get('q') || ''}
        />
      </div>

      <div className="flex gap-4 flex-wrap">
        {/* NEW: Type Filter */}
        {wrapSelect(
          <select 
            className={selectClass}
            onChange={(e) => updateFilter('type', e.target.value)}
            defaultValue={searchParams.get('type') || 'all'}
          >
            <option value="all">All Types</option>
            <option value="public">Public RPC</option>
            <option value="private">Private Gossip</option>
          </select>
        )}

        {/* Status */}
        {wrapSelect(
          <select 
            className={selectClass}
            onChange={(e) => updateFilter('status', e.target.value)}
            defaultValue={searchParams.get('status') || 'all'}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
          </select>
        )}

        {/* Country */}
        {wrapSelect(
          <select 
            className={selectClass}
            onChange={(e) => updateFilter('country', e.target.value)}
            defaultValue={searchParams.get('country') || 'all'}
          >
            <option value="all">All Countries</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Version */}
        {wrapSelect(
          <select 
            className={selectClass}
            onChange={(e) => updateFilter('version', e.target.value)}
            defaultValue={searchParams.get('version') || 'all'}
          >
            <option value="all">All Versions</option>
            {versions.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}