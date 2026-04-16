'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SalesGrowthChartProps {
  data?: { name: string; value: number }[];
}

const defaultBarData = [
  { name: 'JUL', value: 40 },
  { name: 'AGO', value: 65 },
  { name: 'SET', value: 55 },
  { name: 'OUT', value: 80 },
  { name: 'NOV', value: 70 },
  { name: 'DEZ', value: 95 },
];

export function SalesGrowthChart({ data = defaultBarData }: SalesGrowthChartProps) {
  return (
    <div className="h-64 mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E8FF" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 700, fill: '#455f90' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 700, fill: '#455f90' }}
          />
          <Tooltip 
            cursor={{ fill: '#F1F3FF' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Bar 
            dataKey="value" 
            fill="#0c56d0" 
            radius={[4, 4, 0, 0]} 
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface LeadDistributionChartProps {
  data?: { name: string; value: number; color: string }[];
  total?: number;
}

const defaultPieData = [
  { name: 'Direto', value: 45, color: '#0c56d0' },
  { name: 'Indicação', value: 25, color: '#615b77' },
  { name: 'Redes Sociais', value: 30, color: '#ffb400' },
];

export function LeadDistributionChart({ data = defaultPieData, total }: LeadDistributionChartProps) {
  return (
    <div className="h-44 w-44 mx-auto relative mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
        <span className="text-2xl font-black text-on-surface leading-none">{total ?? data.reduce((a, b) => a + b.value, 0)}</span>
        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter mt-0.5">Total Leads</span>
      </div>
    </div>
  );
}
