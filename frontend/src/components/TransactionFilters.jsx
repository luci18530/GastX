import { useState, useMemo } from 'react'
import { Search, Calendar, Filter, X, Download, ChevronDown, ChevronUp } from 'lucide-react'

function TransactionFilters({ 
  transactions, 
  categories,
  onFilterChange,
  onExport
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchText: '',
    minValue: '',
    maxValue: '',
    selectedCategories: [],
    transactionType: 'all' // 'all', 'expenses', 'income'
  })

  // Calcula o range de datas das transações
  const dateRange = useMemo(() => {
    if (!transactions.length) return { min: '', max: '' }
    const dates = transactions.map(t => t.date).sort()
    return { min: dates[0], max: dates[dates.length - 1] }
  }, [transactions])

  // Aplica os filtros
  const applyFilters = (newFilters) => {
    setFilters(newFilters)
    
    let filtered = [...transactions]

    // Filtro por período
    if (newFilters.startDate) {
      filtered = filtered.filter(t => t.date >= newFilters.startDate)
    }
    if (newFilters.endDate) {
      filtered = filtered.filter(t => t.date <= newFilters.endDate)
    }

    // Filtro por texto (descrição)
    if (newFilters.searchText) {
      const search = newFilters.searchText.toLowerCase()
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(search)
      )
    }

    // Filtro por valor
    if (newFilters.minValue !== '') {
      const min = parseFloat(newFilters.minValue)
      filtered = filtered.filter(t => Math.abs(t.amount) >= min)
    }
    if (newFilters.maxValue !== '') {
      const max = parseFloat(newFilters.maxValue)
      filtered = filtered.filter(t => Math.abs(t.amount) <= max)
    }

    // Filtro por categorias
    if (newFilters.selectedCategories.length > 0) {
      filtered = filtered.filter(t => 
        newFilters.selectedCategories.includes(t.category)
      )
    }

    // Filtro por tipo de transação
    if (newFilters.transactionType === 'expenses') {
      filtered = filtered.filter(t => t.amount > 0)
    } else if (newFilters.transactionType === 'income') {
      filtered = filtered.filter(t => t.amount < 0)
    }

    onFilterChange(filtered)
  }

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    applyFilters(newFilters)
  }

  const toggleCategory = (category) => {
    const current = filters.selectedCategories
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category]
    handleChange('selectedCategories', updated)
  }

  const clearFilters = () => {
    const resetFilters = {
      startDate: '',
      endDate: '',
      searchText: '',
      minValue: '',
      maxValue: '',
      selectedCategories: [],
      transactionType: 'all'
    }
    applyFilters(resetFilters)
  }

  const hasActiveFilters = 
    filters.startDate || 
    filters.endDate || 
    filters.searchText || 
    filters.minValue || 
    filters.maxValue ||
    filters.selectedCategories.length > 0 ||
    filters.transactionType !== 'all'

  const activeFiltersCount = [
    filters.startDate || filters.endDate,
    filters.searchText,
    filters.minValue || filters.maxValue,
    filters.selectedCategories.length > 0,
    filters.transactionType !== 'all'
  ].filter(Boolean).length

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Filter className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Filtros e Busca</h3>
            <p className="text-sm text-slate-500">
              {hasActiveFilters 
                ? `${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''} ativo${activeFiltersCount > 1 ? 's' : ''}`
                : 'Clique para expandir'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => { e.stopPropagation(); clearFilters() }}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Limpar filtros
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onExport() }}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-slate-100 space-y-4 animate-fade-in">
          {/* Busca por texto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Buscar por descrição
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Digite para buscar..."
                value={filters.searchText}
                onChange={(e) => handleChange('searchText', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
              {filters.searchText && (
                <button
                  onClick={() => handleChange('searchText', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Calendar className="inline w-4 h-4 mr-1" />
                Data inicial
              </label>
              <input
                type="date"
                value={filters.startDate}
                min={dateRange.min}
                max={filters.endDate || dateRange.max}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Calendar className="inline w-4 h-4 mr-1" />
                Data final
              </label>
              <input
                type="date"
                value={filters.endDate}
                min={filters.startDate || dateRange.min}
                max={dateRange.max}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Valor mínimo (R$)
              </label>
              <input
                type="number"
                placeholder="0,00"
                value={filters.minValue}
                min="0"
                step="0.01"
                onChange={(e) => handleChange('minValue', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Valor máximo (R$)
              </label>
              <input
                type="number"
                placeholder="10000,00"
                value={filters.maxValue}
                min={filters.minValue || "0"}
                step="0.01"
                onChange={(e) => handleChange('maxValue', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Tipo de transação */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tipo de transação
            </label>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Todas' },
                { value: 'expenses', label: 'Gastos' },
                { value: 'income', label: 'Recebimentos' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleChange('transactionType', option.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    filters.transactionType === option.value
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categorias */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Filtrar por categorias
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                    filters.selectedCategories.includes(category)
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {filters.selectedCategories.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                {filters.selectedCategories.length} categoria{filters.selectedCategories.length > 1 ? 's' : ''} selecionada{filters.selectedCategories.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionFilters
