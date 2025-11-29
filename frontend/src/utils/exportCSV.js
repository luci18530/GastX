/**
 * Utilitário para exportar transações para CSV
 */

export function exportToCSV(transactions, filename = 'gastx_export.csv') {
  if (!transactions || transactions.length === 0) {
    alert('Não há transações para exportar.')
    return
  }

  // Cabeçalhos do CSV
  const headers = ['Data', 'Descrição', 'Categoria', 'Confiança', 'Valor']
  
  // Formata as linhas
  const rows = transactions.map(t => {
    const date = formatDateForExport(t.date)
    const title = escapeCSV(t.title)
    const category = t.category || 'Outros'
    const confidence = t.confidence || 'N/A'
    const amount = formatAmountForExport(t.amount)
    
    return [date, title, category, confidence, amount].join(';')
  })

  // Monta o conteúdo do CSV
  const csvContent = [headers.join(';'), ...rows].join('\n')
  
  // Adiciona BOM para correta exibição de caracteres especiais no Excel
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // Cria link de download
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

function formatDateForExport(dateString) {
  try {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR')
  } catch {
    return dateString
  }
}

function formatAmountForExport(amount) {
  // Formata como número brasileiro (vírgula como decimal)
  const value = parseFloat(amount)
  if (isNaN(value)) return '0,00'
  
  // Gastos positivos, recebimentos negativos (mantém o sinal original)
  return value.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

function escapeCSV(text) {
  if (!text) return ''
  // Escapa aspas e envolve em aspas se necessário
  const escaped = text.replace(/"/g, '""')
  if (escaped.includes(';') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped}"`
  }
  return escaped
}

export function generateExportFilename(prefix = 'gastx', suffix = '') {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const parts = [prefix, dateStr]
  if (suffix) parts.push(suffix)
  return parts.join('_') + '.csv'
}
