// src/components/charts/NodeCharts.tsx
"use client";

import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface ChartProps {
  data: any[];
}

// === ГРАФИК 1: CPU и RAM ===
export function ResourcesChart({ data }: ChartProps) {
  const chartData = data.map(item => ({
    ...item,
    time: new Date(item.recordedAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    ramGB: Number((item.ramUsedBytes / (1024 ** 3)).toFixed(2)),
    cpuPercent: Number(item.cpuPercent.toFixed(3)) 
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart 
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        
        <XAxis 
          dataKey="time" 
          stroke="#64748b" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
          tickMargin={10} 
        />
        
        <YAxis yAxisId="left" stroke="#ef4444" fontSize={11} tickLine={false} axisLine={false} unit="%" width={45} />
        <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={11} tickLine={false} axisLine={false} unit=" GB" width={35} />
        
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
        />
        
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        
        <Line yAxisId="left" type="monotone" dataKey="cpuPercent" name="CPU Load" stroke="#ef4444" strokeWidth={2} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="ramGB" name="RAM Usage" stroke="#3b82f6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// === ГРАФИК 2: Хранилище (Used Storage) ===
export function StorageHistoryChart({ data }: ChartProps) {
  // 1. Ищем максимум по USED storage, а не total
  const maxBytes = Math.max(...data.map(d => d.usedBytesStored || 0));
  
  // Определяем единицу измерения на основе занятого места
  let unit = 'KB';
  let divisor = 1024;

  if (maxBytes > 1073741824) { // > 1 GB
    unit = 'GB';
    divisor = 1073741824;
  } else if (maxBytes > 1048576) { // > 1 MB
    unit = 'MB';
    divisor = 1048576;
  }

  // 2. Форматируем данные
  const chartData = data.map(item => ({
    ...item,
    time: new Date(item.recordedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
    // Берем usedBytesStored
    storageValue: Number(((item.usedBytesStored || 0) / divisor).toFixed(2))
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart 
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
      >
        <defs>
          <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        
        <XAxis 
          dataKey="time" 
          stroke="#64748b" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
          tickMargin={10}
          minTickGap={30}
        />
        
        <YAxis 
          stroke="#64748b" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
          width={35}
          domain={[0, 'auto']} 
        />
        
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
          formatter={(value: any) => [`${value} ${unit}`, 'Used Storage']}
        />
        
        <Area 
          type="step" 
          dataKey="storageValue" 
          stroke="#8b5cf6" 
          fillOpacity={1} 
          fill="url(#colorStorage)" 
          strokeWidth={2} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}