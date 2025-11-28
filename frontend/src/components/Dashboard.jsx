import { useState } from 'react'
import { TrendingUp, TrendingDown, CreditCard, PieChart } from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import Pagination from './Pagination'

const COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]

const CATEGORY_ICONS = {
  'Transporte': '🚗',
  'Alimentação': '🍔',
  'Saúde': '💊',
  'Compras': '🛒',
  'Entretenimento': '🎬',
  'Assinaturas': '📱',
  'Casa': '🏠',
  'Educação': '📚',
  'Transferências': '💸',
  'Academia/Esporte': '💪',
  'Outros': '📦'
}

function Dashboard({ data }) {
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20
  
  const { 
    bank_detected, 
    total_transactions, 
    total_spent, 
    total_received,
    transactions, 
    category_summary 
  } = data

  // Calcular paginação
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const endIdx = startIdx + ITEMS_PER_PAGE
  const paginatedTransactions = transactions.slice(startIdx, endIdx)

  const pieData = category_summary.map((item, index) => ({
    name: item.category,
    value: item.total,
    percentage: item.percentage
  }))

  return (
    <div className="animate-fade-in space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<CreditCard className="w-5 h-5" />}
          label="Banco Detectado"
          value={bank_detected}
          color="blue"
        />
        <SummaryCard
          icon={<PieChart className="w-5 h-5" />}
          label="Transações"
          value={total_transactions.toString()}
          color="purple"
        />
        <SummaryCard
          icon={<TrendingDown className="w-5 h-5" />}
          label="Total Gasto"
          value={`R$ ${total_spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color="red"
        />
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Recebido"
          value={`R$ ${total_received.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Gastos por Categoria</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Ranking de Categorias</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {category_summary.map((item, index) => (
              <CategoryRow 
                key={item.category}
                category={item.category}
                total={item.total}
                count={item.count}
                percentage={item.percentage}
                color={COLORS[index % COLORS.length]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Últimas Transações
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Data</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Descrição</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Categoria</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Valor</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-800 font-medium">
                    {transaction.title}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                      {CATEGORY_ICONS[transaction.category] || '📦'} {transaction.category}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-sm font-semibold text-right ${
                    transaction.amount < 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount < 0 ? '+' : '-'} R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col items-center gap-3">
          <p className="text-sm text-slate-600">
            Mostrando {paginatedTransactions.length} de {transactions.length} transações
          </p>
          {transactions.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
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

function CategoryRow({ category, total, count, percentage, color }) {
  return (
    <div className="flex items-center gap-3">
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0" 
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-slate-700 truncate">
            {CATEGORY_ICONS[category] || '📦'} {category}
          </span>
          <span className="text-sm font-bold text-slate-800 ml-2">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-xs text-slate-500 w-12 text-right">
            {percentage}%
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">{count} transações</p>
      </div>
    </div>
  )
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export default Dashboard
