'use client';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const WEEKLY_DATA = [
  { day: 'א', newIssues: 14, resolved: 10 },
  { day: 'ב', newIssues: 22, resolved: 16 },
  { day: 'ג', newIssues: 16, resolved: 20 },
  { day: 'ד', newIssues: 28, resolved: 14 },
  { day: 'ה', newIssues: 18, resolved: 24 },
  { day: 'ו', newIssues: 10, resolved: 12 },
  { day: 'ש', newIssues: 6, resolved: 4 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: 'rgba(15,19,32,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', direction: 'rtl' }}>
      <div style={{ color: '#A5B4FC', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>יום {label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, fontSize: 11 }}>
          {p.dataKey === 'newIssues' ? 'חדשות' : 'טופלו'}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

interface DashboardChartsProps {
  data?: any[];
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  const chartData = data && data.length > 0 ? data : WEEKLY_DATA;

  return (
    <div style={{ width: '100%', height: 180 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="newIssues" stroke="#818CF8" strokeWidth={2} fill="url(#gNew)" dot={{ r: 3, fill: '#818CF8' }} />
          <Area type="monotone" dataKey="resolved" stroke="#34D399" strokeWidth={2} fill="url(#gResolved)" dot={{ r: 3, fill: '#34D399' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
