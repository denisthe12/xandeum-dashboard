// src/components/charts/NetworkGrowthChart.tsx
"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function NetworkGrowthChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart 
        data={data}
        // Убираем отрицательные маржины, они обрезают текст
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        
        <XAxis 
          dataKey="date" 
          stroke="#64748b" 
          tick={{fontSize: 11}} 
          tickLine={false}
          axisLine={false}
          padding={{ left: 10, right: 10 }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
          interval={0} 
        />
        
        <YAxis 
          type="number"
          domain={[0, 'dataMax']} // Оставляем автомасштаб
          stroke="#64748b" 
          tick={{fontSize: 12}}
          tickLine={false}
          axisLine={false}
          allowDecimals={false} 
          // Ширина 30px достаточна для чисел до 999. 
          // Если будет 1000+, Recharts сам попробует впихнуть или обрежет, но 30 - это компактно.
          width={30} 
        />
        
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
          itemStyle={{ color: '#3b82f6' }}
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke="#3b82f6" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorCount)" 
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}