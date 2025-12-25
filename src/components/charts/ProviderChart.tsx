// src/components/charts/ProviderChart.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#64748b'];

export function ProviderChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          // Сдвигаем центр влево (30%), чтобы освободить место справа для длинных названий
          cx="50%" 
          cy="50%"
          // Немного уменьшаем радиус, чтобы точно не обрезалось сверху/снизу
          innerRadius={50} 
          outerRadius={70}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
          ))}
        </Pie>
        
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
          itemStyle={{ color: '#e2e8f0' }}
        />
        
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          iconType="circle"
          // Жестко задаем стили легенды:
          // width: 55% — отдаем ей больше половины места справа
          wrapperStyle={{ 
            fontSize: '11px', 
            color: '#94a3b8',
            width: '55%', 
            right: -40,
            lineHeight: '24px' // Отступ между строками
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}