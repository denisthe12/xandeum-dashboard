// src/components/CommandMenu.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { 
  LayoutDashboard, 
  Server, 
  GitCompare, 
  Bell, 
  Search, 
  Monitor,
  ArrowRight
} from "lucide-react";
import { useCompare } from "../context/CompareContext"; // <--- 1. Импортируем контекст

interface CommandMenuProps {
  nodes: { id: string; ipAddress: string }[];
}

export function CommandMenu({ nodes }: CommandMenuProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  
  // 2. Достаем выбранные ID из глобального состояния
  const { selectedIds } = useCompare();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  // 3. Функция для формирования правильной ссылки сравнения
  const goToCompare = () => {
    if (selectedIds.length > 0) {
      router.push(`/compare?ids=${selectedIds.join(',')}`);
    } else {
      router.push("/compare");
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-start justify-center pt-[15vh] px-4"
    >
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      
      <div className="relative w-full max-w-[640px] bg-slate-950/90 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <Command label="Global Command Menu" className="w-full">
          
          <div className="flex items-center border-b border-slate-800 px-4">
            <Search className="mr-2 h-5 w-5 text-slate-500" />
            <Command.Input 
              placeholder="Type a command or search node..." 
              className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 text-slate-100"
              autoFocus
            />
            <div className="text-xs text-slate-500 border border-slate-800 px-2 py-1 rounded">ESC</div>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-medium text-slate-500 mb-2 px-2">
              <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/nodes"))}>
                <Server className="mr-2 h-4 w-4" />
                All Nodes
              </CommandItem>
              
              {/* ИСПРАВЛЕНИЕ: Используем функцию goToCompare */}
              <CommandItem onSelect={() => runCommand(goToCompare)}>
                <GitCompare className="mr-2 h-4 w-4" />
                Compare Tool 
                {selectedIds.length > 0 && (
                  <span className="ml-2 text-[10px] bg-blue-600 text-white px-1.5 rounded-full">
                    {selectedIds.length}
                  </span>
                )}
              </CommandItem>

              <CommandItem onSelect={() => runCommand(() => router.push("/alerts"))}>
                <Bell className="mr-2 h-4 w-4" />
                Alerts & Monitoring
              </CommandItem>
            </Command.Group>

            <Command.Group heading="Active Nodes" className="text-xs font-medium text-slate-500 mb-2 px-2">
              {nodes.slice(0, 50).map((node) => (
                <CommandItem 
                  key={node.id} 
                  onSelect={() => runCommand(() => router.push(`/node/${encodeURIComponent(node.ipAddress)}`))}
                  value={node.ipAddress}
                >
                  <Monitor className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="flex-1 font-mono">{node.ipAddress}</span>
                  <ArrowRight className="h-3 w-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CommandItem>
              ))}
            </Command.Group>
            
          </Command.List>
          
          <div className="border-t border-slate-800 p-2 text-[10px] text-slate-500 flex justify-between px-4 bg-slate-900/50">
            <span>Xandeum Explorer</span>
            <span>Use arrows to navigate, Enter to select</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function CommandItem({ children, onSelect, value }: any) {
  return (
    <Command.Item
      onSelect={onSelect}
      value={value}
      className="group relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm outline-none aria-selected:bg-blue-600 aria-selected:text-white text-slate-300 transition-colors"
    >
      {children}
    </Command.Item>
  );
}