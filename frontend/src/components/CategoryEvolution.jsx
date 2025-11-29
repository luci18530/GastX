import { useState, useMemo } from 'react'
import { Filter } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts'

const MONTHS_PT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

const CATEGORY_COLORS = {
  'Transporte': '#f97316',
  'Alimentação': '#eab308',
  'Saúde': '#22c55e',
  'Beleza/Cuidados Pessoais': '#ec4899',
  'Compras': '#3b82f6',
  'Entretenimento': '#8b5cf6',
  'Assinaturas': '#06b6d4',
  'Casa': '#84cc16',
  'Educação': '#14b8a6',
  'Transferências': '#6366f1',
  'Academia/Esporte': '#f43f5e',
  'Investimentos': '#10b981',
  'Impostos/Taxas': '#64748b',
  'Outros': '#9ca3af'
}

function CategoryEvolution({ transactions, categorySummary }) {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showAll, setShowAll] = useState(true)

  // Processa dados por categoria e mês
  const { monthlyByCategory, allCategories, months } = useMemo(() => {
    return processCategoryMonthlyData(transactions)
  }, [transactions])

  // Top 5 categorias por valor total
  const topCategories = useMemo(() => {
    return categorySummary.slice(0, 5).map(c => c.category)
  }, [categorySummary])

  // Categorias a exibir
  const displayCategories = showAll 
    ? (selectedCategories.length > 0 ? selectedCategories : topCategories)
    : selectedCategories

  const toggleCategory = (category) => {
    setShowAll(false)
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const resetFilter = () => {
    setShowAll(true)
    setSelectedCategories([])
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Categorias */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtrar Categorias
          </h3>
          <button
            onClick={resetFilter}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Mostrar Top 5
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {allCategories.map(category => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                displayCategories.includes(category)
                  ? 'text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              style={{
                backgroundColor: displayCategories.includes(category) 
                  ? CATEGORY_COLORS[category] || '#64748b'
                  : undefined
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico de Evolução por Categoria */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Evolução de Gastos por Categoria
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {displayCategories.map(category => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  name={category}
                  stroke={CATEGORY_COLORS[category] || '#64748b'}
                  strokeWidth={2}
                  dot={{ fill: CATEGORY_COLORS[category] || '#64748b', strokeWidth: 2, r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparativo Mensal por Categoria */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Comparativo Mensal
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {displayCategories.map(category => (
                <Bar
                  key={category}
                  dataKey={category}
                  name={category}
                  fill={CATEGORY_COLORS[category] || '#64748b'}
                  radius={[2, 2, 0, 0]}
                  stackId="a"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Variação */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Variação Mensal por Categoria
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Categoria</th>
                {months.map(month => (
                  <th key={month} className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayCategories.map(category => (
                <tr key={category} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium text-slate-800">
                    <span className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[category] || '#64748b' }}
                      />
                      {category}
                    </span>
                  </td>
                  {months.map(month => {
                    const dataPoint = monthlyByCategory.find(m => m.month === month)
                    const value = dataPoint ? dataPoint[category] || 0 : 0
                    return (
                      <td key={month} className="py-3 px-4 text-sm text-slate-600 text-right">
                        {value > 0 
                          ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : '-'
                        }
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null

  const sortedPayload = [...payload].sort((a, b) => b.value - a.value)

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 max-w-xs">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      <div className="space-y-1">
        {sortedPayload.filter(entry => entry.value > 0).map((entry, index) => (
          <p key={index} className="text-sm flex justify-between gap-4" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="font-medium">
              R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}

function processCategoryMonthlyData(transactions) {
  const monthlyMap = {}
  const categoriesSet = new Set()
  
  transactions.forEach(t => {
    if (t.amount <= 0) return // Apenas gastos
    
    // Parse date
    let date
    if (t.date.includes('-')) {
      date = new Date(t.date + 'T00:00:00')
    } else if (t.date.includes('/')) {
      const parts = t.date.split('/')
      date = new Date(parts[2], parts[1] - 1, parts[0])
    } else {
      return
    }
    
    const year = date.getFullYear()
    const month = date.getMonth()
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    const monthLabel = `${MONTHS_PT[month]}/${String(year).slice(2)}`
    
    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        key,
        month: monthLabel,
        year,
        monthNum: month
      }
    }
    
    const category = t.category || 'Outros'
    categoriesSet.add(category)
    
    if (!monthlyMap[key][category]) {
      monthlyMap[key][category] = 0
    }
    monthlyMap[key][category] += t.amount
  })
  
  // Ordena por data
  const sorted = Object.values(monthlyMap).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.monthNum - b.monthNum
  })
  
  // Arredonda valores
  const result = sorted.map(m => {
    const rounded = { ...m }
    for (const cat of categoriesSet) {
      if (rounded[cat]) {
        rounded[cat] = Math.round(rounded[cat] * 100) / 100
      }
    }
    return rounded
  })
  
  const months = result.map(m => m.month)
  
  return {
    monthlyByCategory: result,
    allCategories: Array.from(categoriesSet).sort(),
    months
  }
}

export default CategoryEvolution
