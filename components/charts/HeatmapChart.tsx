'use client'

interface Row { insurance_co: string; age: number; price: number }

export default function HeatmapChart({ data }: { data: Row[] }) {
  if (!data.length) return <div className="text-center py-8 text-slate-400">Нет данных</div>

  const companies = [...new Set(data.map(d => d.insurance_co))].sort()
  const ages      = [...new Set(data.map(d => d.age))].sort((a, b) => a - b)
  const map: Record<string, Record<number, number>> = {}
  data.forEach(r => { map[r.insurance_co] ??= {}; map[r.insurance_co][r.age] = r.price })

  const allPrices = data.map(d => d.price)
  const minP = Math.min(...allPrices)
  const maxP = Math.max(...allPrices)

  const cellColor = (price: number | undefined) => {
    if (!price) return '#f1f5f9'
    const ratio = (price - minP) / (maxP - minP || 1)
    const r = Math.round(52 + (220 - 52) * ratio)
    const g = Math.round(211 - (211 - 38) * ratio)
    const b = Math.round(153 - (153 - 38) * ratio)
    return `rgb(${r},${g},${b})`
  }

  const textColor = (price: number | undefined) => {
    if (!price) return '#94a3b8'
    const ratio = (price - minP) / (maxP - minP || 1)
    return ratio > 0.5 ? '#fff' : '#1e293b'
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-separate border-spacing-0.5 min-w-max">
        <thead>
          <tr>
            <th className="text-left px-2 py-1 text-slate-500 font-medium min-w-[160px]">Компания</th>
            {ages.map(a => <th key={a} className="px-2 py-1 text-slate-500 font-medium w-14">{a}</th>)}
          </tr>
        </thead>
        <tbody>
          {companies.map(co => (
            <tr key={co}>
              <td className="px-2 py-1 text-slate-700 font-medium whitespace-nowrap max-w-[200px] truncate" title={co}>
                {co}
              </td>
              {ages.map(age => {
                const price = map[co]?.[age]
                return (
                  <td key={age}
                    className="px-1 py-1 text-center rounded font-medium transition-all"
                    style={{ background: cellColor(price), color: textColor(price) }}>
                    {price ? (price / 1000).toFixed(1) + 'k' : '—'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ background: cellColor(minP) }} />
          Дешевле {(minP / 1000).toFixed(1)}k
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ background: cellColor(maxP) }} />
          Дороже {(maxP / 1000).toFixed(1)}k
        </div>
      </div>
    </div>
  )
}
