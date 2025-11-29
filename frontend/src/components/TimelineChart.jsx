import { useState } from 'react'
import { Calendar, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
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
  Legend,
  AreaChart,
  Area
} from 'recharts'

const MONTHS_PT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

function TimelineChart({ transactions }) {
  const [chartType, setChartType] = useState('bar') // 'bar', 'line', 'area'
  
  // Processa transações por mês
  const monthlyData = processMonthlyData(transactions)
  
  // Calcula estatísticas
  const stats = calculateStats(monthlyData)

  return (
    <div className="space-y-6">
      {/* Estatísticas Mensais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Meses Analisados"
          value={monthlyData.length.toString()}
          color="blue"
        />
        <StatCard
          icon={<TrendingDown className="w-5 h-5" />}
          label="Média Mensal (Gastos)"
          value={`R$ ${stats.avgSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color="red"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Média Mensal (Recebidos)"
          value={`R$ ${stats.avgReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color="green"
        />
      </div>

      {/* Gráfico de Evolução Temporal */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Evolução Mensal</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                chartType === 'bar' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Barras
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                chartType === 'line' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Linha
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                chartType === 'area' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Área
            </button>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={monthlyData}>
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
                <Bar 
                  dataKey="spent" 
                  name="Gastos" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="received" 
                  name="Recebidos" 
                  fill="#22c55e" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={monthlyData}>
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
                <Line 
                  type="monotone" 
                  dataKey="spent" 
                  name="Gastos" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="received" 
                  name="Recebidos" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <AreaChart data={monthlyData}>
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
                <Area 
                  type="monotone" 
                  dataKey="spent" 
                  name="Gastos" 
                  stroke="#ef4444" 
                  fill="#fecaca"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="received" 
                  name="Recebidos" 
                  stroke="#22c55e" 
                  fill="#bbf7d0"
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Resumo Mensal */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Resumo por Mês</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Mês</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Transações</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Gastos</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Recebidos</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row, index) => {
                const balance = row.received - row.spent
                return (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">
                      {row.monthFull}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 text-right">
                      {row.count}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-red-600 text-right">
                      R$ {row.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-green-600 text-right">
                      R$ {row.received.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-4 text-sm font-bold text-right ${
                      balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {balance >= 0 ? '+' : ''} R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600'
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  )
}

function processMonthlyData(transactions) {
  const monthlyMap = {}
  
  transactions.forEach(t => {
    // Parse date - suporta formatos: YYYY-MM-DD, DD/MM/YYYY
    let date
    if (t.date.includes('-')) {
      date = new Date(t.date + 'T00:00:00')
    } else if (t.date.includes('/')) {
      const parts = t.date.split('/')
      date = new Date(parts[2], parts[1] - 1, parts[0])
    } else {
      return // Skip invalid dates
    }
    
    const year = date.getFullYear()
    const month = date.getMonth()
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    
    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        key,
        year,
        monthNum: month,
        month: `${MONTHS_PT[month]}/${String(year).slice(2)}`,
        monthFull: `${MONTHS_PT[month]} ${year}`,
        spent: 0,
        received: 0,
        count: 0
      }
    }
    
    if (t.amount > 0) {
      monthlyMap[key].spent += t.amount
    } else {
      monthlyMap[key].received += Math.abs(t.amount)
    }
    monthlyMap[key].count++
  })
  
  // Ordena por data
  const sorted = Object.values(monthlyMap).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.monthNum - b.monthNum
  })
  
  // Arredonda valores
  return sorted.map(m => ({
    ...m,
    spent: Math.round(m.spent * 100) / 100,
    received: Math.round(m.received * 100) / 100
  }))
}

function calculateStats(monthlyData) {
  if (monthlyData.length === 0) {
    return { avgSpent: 0, avgReceived: 0 }
  }
  
  const totalSpent = monthlyData.reduce((sum, m) => sum + m.spent, 0)
  const totalReceived = monthlyData.reduce((sum, m) => sum + m.received, 0)
  
  return {
    avgSpent: Math.round((totalSpent / monthlyData.length) * 100) / 100,
    avgReceived: Math.round((totalReceived / monthlyData.length) * 100) / 100
  }
}

export default TimelineChart
