'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface RankPoint { day: string; site: string; rank: number; price: number }

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']

export default function RankLineChart({ data }: { data: RankPoint[] }) {
  const sites = [...new Set(data.map(d => d.site))]
  const byDay: Record<string, Record<string, number>> = {}
  data.forEach(r => {
    byDay[r.day] ??= {}
    byDay[r.day][r.site] = r.rank
  })
  const chartData = Object.entries(byDay).map(([day, vals]) => ({
    day: new Date(day).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
    ...vals,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis reversed tick={{ fontSize: 11, fill: '#64748b' }} domain={[1, 'dataMax + 1']}
          label={{ value: 'Позиция', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }} />
        <Legend />
        {sites.map((s, i) => (
          <Line key={s} type="monotone" dataKey={s} stroke={COLORS[i % COLORS.length]}
            strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
