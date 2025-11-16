'use client'

import { useState, useRef } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import { validateImageFile, formatFileSize } from '@/lib/utils/image'
import { validateImage, validateFullBodyImage } from '@/lib/utils/imageValidation'
import { Button } from '@/components/ui/button'
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
        const advancedValidation = await validateImage(file)
        
        if (!advancedValidation.valid) {
          setError(advancedValidation.errors.join(', '))
          setIsValidating(false)
          return
        }

        if (advancedValidation.warnings.length > 0) {
          setWarnings(advancedValidation.warnings)
          // Mostra warnings mas não bloqueia
          advancedValidation.warnings.forEach(warning => {
            toast.error(warning, { duration: 4000 })
          })
        }

        if (advancedValidation.suggestions.length > 0) {
          setSuggestions(advancedValidation.suggestions)
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
        {displayFile && (
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gold/70 text-center font-light">
              {displayFile.name} ({formatFileSize(displayFile.size)})
            </p>
            {warnings.length > 0 && (
              <div className="flex items-center justify-center gap-1 text-xs text-yellow-400">
                <AlertCircle className="w-3 h-3" />
                <span>{warnings[0]}</span>
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
