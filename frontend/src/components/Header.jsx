import { RefreshCw } from 'lucide-react'

function Header({ onReset, hasData }) {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="GastX Logo" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">GastX</h1>
              <p className="text-xs text-slate-500">Analisador de Gastos</p>
            </div>
          </div>

          {hasData && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Novo Upload
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
