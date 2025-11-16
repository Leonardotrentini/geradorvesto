'use client'

import { useState, useRef } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import { validateImageFile, formatFileSize } from '@/lib/utils/image'
import { validateImage, validateFullBodyImage } from '@/lib/utils/imageValidation'
import { advancedValidation } from '@/lib/utils/advancedValidation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ImageDropzoneProps {
  onFileSelect: (file: File | null) => void
  currentFile?: File | null
  className?: string
  label?: string
  isPersonImage?: boolean // Se true, valida se é foto de corpo inteiro
  showValidation?: boolean // Se true, mostra validação avançada
}

export function ImageDropzone({ 
  onFileSelect, 
  currentFile, 
  className,
  label = 'Arraste a foto aqui',
  isPersonImage = false,
  showValidation = true,
}: ImageDropzoneProps) {
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationScore, setValidationScore] = useState<number | null>(null)
  const [validationDetails, setValidationDetails] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setIsValidating(true)
    setError(null)
    setWarnings([])
    setSuggestions([])

    // Validação básica primeiro
    const basicValidation = validateImageFile(file)
    if (!basicValidation.valid) {
      setError(basicValidation.error || 'Erro ao validar arquivo')
      setIsValidating(false)
      return
    }

    // Validação avançada (se habilitada)
    if (showValidation) {
      try {
        // Validação básica primeiro
        const basicValidation = await validateImage(file)
        
        if (!basicValidation.valid) {
          setError(basicValidation.errors.join(', '))
          setIsValidating(false)
          return
        }

        if (basicValidation.warnings.length > 0) {
          setWarnings(basicValidation.warnings)
        }

        if (basicValidation.suggestions.length > 0) {
          setSuggestions(basicValidation.suggestions)
        }

        // Validação avançada completa
        try {
          const advancedResult = await advancedValidation(file, {
            isPersonImage,
            isGarmentImage: !isPersonImage,
          })

          setValidationScore(advancedResult.score)
          setValidationDetails(advancedResult.details)

          // Adiciona erros, warnings e sugestões da validação avançada
          if (advancedResult.errors.length > 0) {
            setError(prev => prev ? `${prev}. ${advancedResult.errors.join('. ')}` : advancedResult.errors.join('. '))
            advancedResult.errors.forEach(err => {
              toast.error(err, { duration: 5000 })
            })
          }

          if (advancedResult.warnings.length > 0) {
            setWarnings(prev => [...prev, ...advancedResult.warnings])
            advancedResult.warnings.forEach(warn => {
              toast.error(warn, { duration: 4000 })
            })
          }

          if (advancedResult.suggestions.length > 0) {
            setSuggestions(prev => [...prev, ...advancedResult.suggestions])
          }

          // Feedback do score
          if (advancedResult.score >= 8) {
            toast.success(`Imagem de alta qualidade! (${advancedResult.score}/10)`, { duration: 3000 })
          } else if (advancedResult.score >= 6) {
            toast(`Imagem aceitável (${advancedResult.score}/10). Algumas melhorias recomendadas.`, { 
              icon: '⚠️',
              duration: 4000 
            })
          } else {
            toast.error(`Imagem com problemas (${advancedResult.score}/10). Revise os avisos.`, { duration: 5000 })
          }
        } catch (advancedError: any) {
          console.warn('Erro na validação avançada completa:', advancedError)
          // Continua mesmo se validação avançada falhar
        }

        // Validação específica para foto de pessoa (corpo inteiro)
        if (isPersonImage) {
          try {
            const fullBodyValidation = await validateFullBodyImage(file)
            if (!fullBodyValidation.isFullBody && fullBodyValidation.suggestion) {
              setWarnings(prev => [...prev, fullBodyValidation.suggestion!])
              toast.error(fullBodyValidation.suggestion, { duration: 5000 })
            }
          } catch (error) {
            console.warn('Erro ao validar corpo inteiro:', error)
          }
        }
      } catch (error: any) {
        console.error('Erro na validação avançada:', error)
        // Não bloqueia se a validação avançada falhar
      }
    }

    setIsValidating(false)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
      onFileSelect(file)
    }
    reader.onerror = () => {
      setError('Erro ao ler arquivo')
    }
    reader.readAsDataURL(file)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    setWarnings([])
    setSuggestions([])
    setValidationScore(null)
    setValidationDetails(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Use preview if available, otherwise use currentFile
  const displayFile = preview ? null : currentFile
  const imageSrc = preview || (currentFile ? URL.createObjectURL(currentFile) : '')

  if (imageSrc) {
    return (
      <div className={className || ''}>
        <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gold/30 bg-[#1a4d3a]/40">
          <img
            src={imageSrc}
            alt="Preview"
            className="w-full h-full object-contain"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-50"
            onClick={handleRemove}
            type="button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        {(displayFile || preview) && (
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gold/70 text-center font-light">
              {displayFile?.name || 'Imagem selecionada'} ({displayFile ? formatFileSize(displayFile.size) : ''})
            </p>
            
            {/* Score de Validação */}
            {validationScore !== null && (
              <div className={`flex items-center justify-center gap-2 px-3 py-1 rounded-lg ${
                validationScore >= 8 ? 'bg-green-500/20 border border-green-500/30' :
                validationScore >= 6 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                'bg-red-500/20 border border-red-500/30'
              }`}>
                {validationScore >= 8 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : validationScore >= 6 ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-xs font-semibold ${
                  validationScore >= 8 ? 'text-green-400' :
                  validationScore >= 6 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  Qualidade: {validationScore}/10
                </span>
              </div>
            )}

            {/* Detalhes da Validação */}
            {validationDetails && (
              <div className="text-xs text-gold/60 space-y-1">
                <p className="text-center">
                  {validationDetails.dimensions.width}x{validationDetails.dimensions.height}px
                  {validationDetails.dimensions.aspectRatio && ` • ${validationDetails.dimensions.aspectRatio.toFixed(2)}:1`}
                </p>
                {isPersonImage && validationDetails.isFullBody !== undefined && (
                  <p className="text-center">
                    {validationDetails.isFullBody ? '✅ Corpo inteiro' : '⚠️ Pode não ser corpo inteiro'}
                  </p>
                )}
                {!isPersonImage && validationDetails.isWhiteBackground !== undefined && (
                  <p className="text-center">
                    {validationDetails.isWhiteBackground ? '✅ Fundo branco' : '⚠️ Fundo pode não ser branco'}
                  </p>
                )}
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="space-y-1">
                {warnings.slice(0, 2).map((warning, idx) => (
                  <div key={idx} className="flex items-start justify-center gap-1 text-xs text-yellow-400">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="text-center">{warning}</span>
                  </div>
                ))}
                {warnings.length > 2 && (
                  <p className="text-xs text-yellow-400/70 text-center">
                    +{warnings.length - 2} avisos adicionais
                  </p>
                )}
              </div>
            )}

            {/* Errors */}
            {error && (
              <div className="flex items-start justify-center gap-1 text-xs text-red-400">
                <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="text-center">{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className || ''}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors
          ${isDragging ? 'border-gold bg-gold/10' : 'border-gold/30 hover:border-gold/50 bg-[#1a4d3a]/40'}
          ${error ? 'border-red-500 bg-red-500/10' : ''}
        `}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-gold" />
          </div>
          {error ? (
            <div>
              <p className="text-red-400 font-medium mb-1">Erro no upload</p>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold text-gold mb-2">
                {isDragging ? 'Solte a imagem aqui' : label}
              </p>
              <p className="text-sm text-gold/70 font-light">
                ou clique para selecionar
              </p>
              <p className="text-xs text-gold/50 mt-2 font-light">
                JPG, PNG ou WebP (máx. 10MB)
              </p>
              {isValidating && (
                <p className="text-xs text-gold/50 mt-2 font-light animate-pulse">
                  Validando imagem...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
