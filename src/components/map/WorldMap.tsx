// src/components/map/WorldMap.tsx
"use client";

import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./MapClient'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-500 rounded-xl">
      Loading Map...
    </div>
  )
});

export function WorldMap({ data }: { data: any[] }) {
  return (
    // Уменьшили высоту до 350px (было 400+)
    <div className="h-[350px] w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
      <MapClient data={data} />
    </div>
  );
}