'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Offer { site: string; insurance_co: string; price: number; rank: number }

export default function PriceBarChart({ offers }: { offers: Offer[] }) {
  const data = offers.map(o => ({
    name: o.insurance_co.length > 18 ? o.insurance_co.slice(0, 17) + '…' : o.insurance_co,
    price: o.price,
    site: o.site,
    fullName: o.insurance_co,
  }))
  const min = Math.min(...data.map(d => d.price))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }}
          angle={-35} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }}
          tickFormatter={v => (v / 1000).toFixed(0) + 'k'} />
        <Tooltip
          formatter={(v: number) => [v.toLocaleString('ru-RU') + ' ₽', 'Цена']}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
        />
        <Bar dataKey="price" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.price === min ? '#10b981' : '#3b82f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
