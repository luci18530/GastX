import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import axios from 'axios'

function UploadArea({ onUploadSuccess, isLoading, setIsLoading }) {
  const [error, setError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError(null)
    setUploadedFile(file)
    setIsLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('http://localhost:8000/upload/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        onUploadSuccess(response.data)
      } else {
        setError('Erro ao processar o arquivo')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.detail || 'Erro ao enviar arquivo. Verifique se o servidor está rodando.')
      setUploadedFile(null)
    } finally {
      setIsLoading(false)
    }
  }, [onUploadSuccess, setIsLoading])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    disabled: isLoading
  })

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">
          Analise seus gastos de forma inteligente
        </h2>
        <p className="text-slate-600 max-w-xl mx-auto">
          Faça upload do seu extrato bancário em CSV e obtenha insights 
          automáticos sobre suas despesas, categorias e padrões de consumo.
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200 ease-out
          ${isDragActive 
            ? 'border-green-500 bg-green-50' 
            : 'border-slate-300 hover:border-green-400 hover:bg-slate-50'
          }
          ${isLoading ? 'pointer-events-none opacity-75' : ''}
        `}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
            <div>
              <p className="text-lg font-medium text-slate-700">Processando...</p>
              <p className="text-sm text-slate-500">Analisando suas transações</p>
            </div>
          </div>
        ) : uploadedFile && !error ? (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <div>
              <p className="text-lg font-medium text-slate-700">{uploadedFile.name}</p>
              <p className="text-sm text-slate-500">Arquivo carregado com sucesso!</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${isDragActive ? 'bg-green-100' : 'bg-slate-100'}
            `}>
              <Upload className={`w-8 h-8 ${isDragActive ? 'text-green-600' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-700">
                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste seu arquivo CSV aqui'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                ou clique para selecionar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Erro no upload</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Supported Banks */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <p className="text-sm text-slate-500">Bancos suportados:</p>
        <div className="flex gap-3">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
            Nubank
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
            Inter
          </span>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
            CSV Genérico
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <InstructionCard
          icon={<FileText className="w-6 h-6" />}
          title="1. Exporte seu extrato"
          description="Baixe o extrato em CSV do aplicativo do seu banco"
        />
        <InstructionCard
          icon={<Upload className="w-6 h-6" />}
          title="2. Faça o upload"
          description="Arraste o arquivo ou clique para selecioná-lo"
        />
        <InstructionCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          title="3. Analise"
          description="Veja gráficos, categorias e insights automáticos"
        />
      </div>
    </div>
  )
}

function InstructionCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  )
}

export default UploadArea
