'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageDropzone } from '@/components/upload/ImageDropzone'
import { Upload, Loader2, CheckCircle2, XCircle, Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface ScanResult {
  garment_id: string
  garment_image: string
  garment_mask: string
  metadata: {
    type: string
    color: string
    pattern: string
    dimensions: {
      width: number
      height: number
    }
    quality_score: number
  }
  created_at: string
}

export default function ScanPage() {
  const [image, setImage] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [validation, setValidation] = useState<any>(null)

  const handleImageSelect = async (file: File | null) => {
    console.log('🔵 handleImageSelect chamado com:', file?.name || 'null')
    if (file) {
      setImage(file)
      setResult(null)
      setValidation(null)
      // Validação prévia (opcional - pode ser feita no backend)
      toast.info('Imagem selecionada. Clique em "Escanear Peça" para iniciar.')
    } else {
      setImage(null)
      setResult(null)
      setValidation(null)
    }
  }

  const handleScan = async () => {
    if (!image) {
      toast.error('Por favor, selecione uma imagem primeiro')
      return
    }

    setIsScanning(true)
    setResult(null)
    toast.loading('Escaneando peça... Isso pode levar de 30s a 2min', {
      id: 'scanning',
      duration: 5000,
    })

    try {
      const formData = new FormData()
      formData.append('image', image)

      const response = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao escanear peça')
      }

      if (data.success && data.result) {
        setResult(data.result)
        toast.success('Peça escaneada com sucesso!', { id: 'scanning' })
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (error: any) {
      console.error('Erro ao escanear:', error)
      toast.error(error.message || 'Erro ao escanear peça', { id: 'scanning' })
    } finally {
      setIsScanning(false)
    }
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
      toast.success('Download iniciado!')
    } catch (error: any) {
      toast.error('Erro ao baixar imagem')
    }
  }

  return (
    <div className="min-h-screen bg-vesto-green py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">
            Módulo 1: Scan da Peça
          </h1>
          <p className="text-gold/70 text-lg">
            Escaneie uma peça de roupa e transforme em garment digital padronizado
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="bg-[#1a4d3a] border-gold/30">
            <CardHeader>
              <CardTitle className="text-gold">1. Upload da Peça</CardTitle>
              <CardDescription className="text-gold/70">
                Envie uma foto da roupa (packshot, fundo claro)
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <ImageDropzone
                label="Arraste a foto da peça aqui"
                currentFile={image}
                onFileSelect={handleImageSelect}
                showValidation={true}
                isPersonImage={false}
              />

              {image && (
                <div className="mt-4">
                  <Button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="w-full bg-gold hover:bg-gold/90 text-vesto-green font-semibold"
                    size="lg"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Escaneando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Escanear Peça
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-[#1a4d3a] border-gold/30">
            <CardHeader>
              <CardTitle className="text-gold">2. Resultado do Scan</CardTitle>
              <CardDescription className="text-gold/70">
                Garment digital padronizado e metadados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !isScanning && (
                <div className="text-center py-12 text-gold/50">
                  <p>Nenhum resultado ainda.</p>
                  <p className="text-sm mt-2">Faça upload de uma imagem e clique em "Escanear Peça"</p>
                </div>
              )}

              {isScanning && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-gold mx-auto mb-4" />
                  <p className="text-gold">Processando...</p>
                  <p className="text-gold/70 text-sm mt-2">
                    Validação → Segmentação → Normalização → Classificação
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Garment ID */}
                  <div className="bg-[#0f3528] p-4 rounded-lg border border-gold/20">
                    <p className="text-gold/70 text-sm mb-1">Garment ID</p>
                    <p className="text-gold font-mono text-sm break-all">{result.garment_id}</p>
                  </div>

                  {/* Metadata */}
                  <div className="bg-[#0f3528] p-4 rounded-lg border border-gold/20">
                    <p className="text-gold font-semibold mb-3">Metadados</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gold/70">Tipo</p>
                        <p className="text-gold capitalize">{result.metadata.type}</p>
                      </div>
                      <div>
                        <p className="text-gold/70">Cor</p>
                        <p className="text-gold capitalize">{result.metadata.color}</p>
                      </div>
                      <div>
                        <p className="text-gold/70">Padrão</p>
                        <p className="text-gold capitalize">{result.metadata.pattern}</p>
                      </div>
                      <div>
                        <p className="text-gold/70">Qualidade</p>
                        <p className="text-gold">
                          {result.metadata.quality_score}/10
                          {result.metadata.quality_score >= 8 && (
                            <CheckCircle2 className="w-4 h-4 inline ml-1 text-green-400" />
                          )}
                          {result.metadata.quality_score < 6 && (
                            <XCircle className="w-4 h-4 inline ml-1 text-red-400" />
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gold/70">Dimensões</p>
                        <p className="text-gold">
                          {result.metadata.dimensions.width}×{result.metadata.dimensions.height}px
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="space-y-4">
                    {/* Garment Image */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gold font-semibold">Imagem Normalizada</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(result.garment_image, 'garment-normalized.png')}
                          className="border-gold/30 text-gold hover:bg-gold/10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold/30 bg-[#0f3528]">
                        <img
                          src={result.garment_image}
                          alt="Garment normalizado"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Mask */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gold font-semibold">Máscara</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(result.garment_mask, 'garment-mask.png')}
                          className="border-gold/30 text-gold hover:bg-gold/10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold/30 bg-[#0f3528]">
                        <img
                          src={result.garment_mask}
                          alt="Máscara do garment"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <p className="text-green-400 font-semibold">Scan concluído com sucesso!</p>
                    </div>
                    <p className="text-green-300/80 text-sm mt-2">
                      O garment digital está pronto para ser usado nos módulos de try-on.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-6 bg-[#1a4d3a] border-gold/30">
          <CardHeader>
            <CardTitle className="text-gold">ℹ️ Sobre o Scan da Peça</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gold/80">
              <div>
                <p className="font-semibold text-gold mb-2">O que faz:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Valida qualidade da imagem</li>
                  <li>Remove fundo e segmenta a peça</li>
                  <li>Normaliza para canvas padrão (1024×1024)</li>
                  <li>Classifica tipo, cor e padrão</li>
                  <li>Gera garment_id único</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gold mb-2">Requisitos:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Resolução mínima: 1024px (ideal: 2048px+)</li>
                  <li>Fundo claro (branco/neutro)</li>
                  <li>Peça inteira visível</li>
                  <li>Boa iluminação</li>
                  <li>Formato: JPG, PNG, WebP</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

