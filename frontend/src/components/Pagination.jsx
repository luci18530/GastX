import { ChevronLeft, ChevronRight } from 'lucide-react'

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-between mt-4 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="text-sm text-slate-600">
        Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            const pageNum = i + 1
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  currentPage === pageNum
                    ? 'bg-green-500 text-white'
                    : 'hover:bg-slate-200'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          {totalPages > 5 && <span className="px-2 text-slate-400">...</span>}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
