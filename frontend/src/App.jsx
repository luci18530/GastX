import { useState } from 'react'
import Header from './components/Header'
import UploadArea from './components/UploadArea'
import Dashboard from './components/Dashboard'

function App() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleUploadSuccess = (responseData) => {
    setData(responseData)
  }

  const handleReset = () => {
    setData(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header onReset={handleReset} hasData={!!data} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {!data ? (
          <UploadArea 
            onUploadSuccess={handleUploadSuccess}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <Dashboard data={data} />
        )}
      </main>

      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>GastX v0.2.0 - Analisador Inteligente de Gastos</p>
      </footer>
    </div>
  )
}

export default App
