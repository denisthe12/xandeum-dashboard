// src/components/Navbar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Server, GitCompare, Bell } from 'lucide-react';
import { useCompare } from '../context/CompareContext'; // Импортируем хук

export function Navbar() {
  const pathname = usePathname();
  const { selectedIds } = useCompare(); // Получаем список ID

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50';
  };

  // Генерируем ссылку: если есть выбранные, то /compare?ids=..., иначе просто /compare
  const compareLink = selectedIds.length > 0 
    ? `/compare?ids=${selectedIds.join(',')}` 
    : '/compare';

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-slate-950 font-bold">
              X
            </div>
            <span className="font-bold text-lg text-slate-100 hidden sm:block">
              Xandeum Explorer
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/')}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <Link 
              href="/nodes" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/nodes')}`}
            >
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">Nodes</span>
            </Link>

            <Link 
              href={compareLink} 
              className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/compare')}`}
            >
              <GitCompare className="h-4 w-4" />
              <span className="hidden sm:inline">Compare</span>
              
              {/* Бейдж с количеством */}
              {selectedIds.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  {selectedIds.length}
                </span>
              )}
            </Link>
            <Link 
              href="/alerts" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/alerts')}`}
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}