'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImageDropzone } from '@/components/upload/ImageDropzone'
import { GenderSelector } from '@/components/avatar/GenderSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Gender } from '@/types/avatar'
import { Sparkles, Loader2, Info, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function GeneratePage() {
  const [productImage, setProductImage] = useState<File | null>(null)
  const [personImage, setPersonImage] = useState<File | null>(null)
  const [gender, setGender] = useState<Gender>('mulher') // Usado para o manequim
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!productImage) {
      toast.error('Por favor, selecione uma imagem do produto')
      return
    }

    if (!personImage) {
      toast.error('Por favor, selecione uma imagem de pessoa/modelo')
      return
    }

    setIsGenerating(true)
    toast.loading('Preparando geração... Isso pode levar de 30s a 2min', { 
      id: 'generating',
      duration: 5000,
    })

    try {
      const formData = new FormData()
      formData.append('productImage', productImage)
      formData.append('personImage', personImage) // Imagem de pessoa obrigatória para avatar
      formData.append('config', JSON.stringify({
        gender, // Gênero para o manequim
      }))

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar imagens')
      }

      // Se retornou resultado imediato
      if (data.result) {
        console.log('Result received:', data.result)
        console.log('Images:', data.result.images)
        
        // Garante que as imagens são URLs válidas
        const images = data.result.images || []
        const validImages = images.filter((img: any) => img && typeof img === 'string')
        
        if (validImages.length === 0) {
          throw new Error('Nenhuma imagem válida foi retornada')
        }
        
        // Salva no sessionStorage para a página de resultado acessar
        sessionStorage.setItem('lastGeneration', JSON.stringify({
          id: data.result.id,
          images: validImages,
          config: data.result.config,
        }))
        
        toast.success('Imagens geradas com sucesso!', { id: 'generating' })
        window.location.href = `/generate/result?id=${data.result.id}`
        return
      }

      // Se retornou jobId (processamento assíncrono)
      if (data.jobId) {
        toast.loading('Processando... Isso pode levar alguns minutos', { id: 'generating' })
        window.location.href = `/generate/result?jobId=${data.jobId}`
        return
      }

      throw new Error('Resposta inesperada da API')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar imagens', { id: 'generating' })
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-vesto-green py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header com Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-4xl font-bold text-gold-bright mb-1">VESTO</h1>
            <p className="text-sm text-gold font-light tracking-widest">co.</p>
          </Link>
          <h2 className="text-3xl md:text-4xl font-semibold text-gold mb-2 mt-6">
            Gerar Fotos do Produto
          </h2>
          <p className="text-gold/70 font-light">
            Gere 2 variações: Avatar vestindo a peça + Manequim de loja
          </p>
        </div>

        {/* Template/Exemplos */}
        <Card className="mb-8 border-gold/30 bg-[#1a4d3a]/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gold">
              <Info className="w-5 h-5" />
              Como enviar as imagens corretamente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Exemplo 1: Roupa */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gold-bright">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">Foto da Roupa</span>
                </div>
                <div className="relative aspect-square bg-white rounded-lg border-2 border-gold/30 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="w-24 h-32 mx-auto mb-3 bg-gradient-to-b from-gray-200 to-gray-300 rounded border-2 border-gray-400 relative">
                        <div className="absolute top-2 left-2 right-2 h-8 bg-gray-400 rounded"></div>
                        <div className="absolute bottom-2 left-2 right-2 h-16 bg-gray-500 rounded"></div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">Roupa isolada</p>
                      <p className="text-xs text-gray-500">Fundo branco/transparente</p>
                    </div>
                  </div>
                </div>
                <ul className="text-xs text-gold/70 space-y-1 font-light">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-bright mt-0.5">✓</span>
                    <span>Roupa isolada em fundo branco</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-bright mt-0.5">✓</span>
                    <span>Boa iluminação e nitidez</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-bright mt-0.5">✓</span>
                    <span>Roupa visível e completa</span>
                  </li>
                </ul>
              </div>

              {/* Exemplo 2: Pessoa */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gold-bright">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">Foto da Pessoa/Modelo</span>
                </div>
                <div className="relative aspect-[3/4] bg-white rounded-lg border-2 border-gold/30 overflow-hidden">
                  {/* Fundo neutro */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100"></div>
                  
                  {/* Silhueta completa do corpo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                      {/* Linha de referência superior (cabeça) */}
                      <div className="absolute top-2 left-0 right-0 h-0.5 bg-gold/30"></div>
                      <div className="absolute top-1 left-2 text-[6px] text-gold/50 font-medium">CABEÇA</div>
                      
                      {/* Corpo completo */}
                      <div className="relative flex flex-col items-center">
                        {/* Cabeça */}
                        <div className="w-14 h-14 bg-gradient-to-b from-pink-200 to-pink-300 rounded-full border-2 border-pink-400 mb-1"></div>
                        
                        {/* Tronco */}
                        <div className="w-16 h-20 bg-gradient-to-b from-pink-300 to-pink-400 rounded-t-lg mb-1"></div>
                        
                        {/* Cintura */}
                        <div className="w-12 h-2 bg-pink-500 mb-1"></div>
                        
                        {/* Quadris */}
                        <div className="w-14 h-4 bg-pink-400 mb-1"></div>
                        
                        {/* Pernas */}
                        <div className="w-10 h-24 bg-gradient-to-b from-pink-300 to-pink-400 rounded-b-lg mb-1"></div>
                        
                        {/* Pés - CRÍTICO mostrar */}
                        <div className="flex gap-1">
                          <div className="w-6 h-3 bg-pink-500 rounded-t-full"></div>
                          <div className="w-6 h-3 bg-pink-500 rounded-t-full"></div>
                        </div>
                      </div>
                      
                      {/* Linha de referência inferior (pés) */}
                      <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-gold/30"></div>
                      <div className="absolute bottom-1 left-2 text-[6px] text-gold/50 font-medium">PÉS</div>
                      
                      {/* Indicador de proporção */}
                      <div className="absolute top-1 right-2 text-[6px] text-gold/50 font-medium bg-gold/10 px-1 rounded">
                        3:4
                      </div>
                    </div>
                  </div>
                  
                  {/* Overlay com informações */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white p-2">
                    <p className="text-[10px] font-semibold text-center">CORPO INTEIRO</p>
                    <p className="text-[8px] text-center text-gray-200">Da cabeça aos pés</p>
                  </div>
                </div>
                <ul className="text-xs text-gold/70 space-y-1 font-light">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-bright mt-0.5">✓</span>
                    <span><strong>Corpo inteiro obrigatório</strong> (da cabeça aos pés)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-bright mt-0.5">✓</span>
                    <span>Boa iluminação e foco</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-bright mt-0.5">✓</span>
                    <span>Pose clara e natural (vertical)</span>
                  </li>
                  <li className="flex items-start gap-2 mt-2">
                    <span className="text-red-400 mt-0.5">⚠</span>
                    <span className="text-red-300">Evite cortes no meio do corpo</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-gold/10 border border-gold/20 rounded-lg">
                <p className="text-xs text-gold/80 font-light text-center">
                  <span className="font-semibold text-gold-bright">Dica:</span> Imagens de qualidade garantem melhores resultados na geração!
                </p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-300 font-light text-center">
                  <span className="font-semibold text-red-400">Importante:</span> A foto da pessoa deve mostrar o corpo INTEIRO (da cabeça aos pés), especialmente para vestidos longos!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Upload da Roupa</CardTitle>
              </CardHeader>
                    <CardContent>
                      <ImageDropzone
                        onFileSelect={(file) => setProductImage(file)}
                        currentFile={productImage}
                        label="Arraste a foto do produto aqui"
                        showValidation={true}
                      />
                      <p className="text-xs text-gold/50 mt-2 text-center font-light">
                        Foto da peça de roupa que será vestida
                      </p>
                    </CardContent>
            </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>2. Upload da Pessoa/Modelo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ImageDropzone
                        onFileSelect={(file) => setPersonImage(file)}
                        currentFile={personImage}
                        label="Arraste a foto da pessoa/modelo aqui"
                        isPersonImage={true}
                        showValidation={true}
                      />
                      <p className="text-xs text-gold/50 mt-2 text-center font-light">
                        Foto de corpo inteiro da pessoa que vai vestir a roupa (obrigatório)
                      </p>
                    </CardContent>
                  </Card>
          </div>

          {/* Right Column - Configurações */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>3. Gênero do Manequim</CardTitle>
              </CardHeader>
              <CardContent>
                <GenderSelector value={gender} onChange={setGender} />
                <p className="text-xs text-gold/50 mt-3 text-center font-light">
                  Selecione o gênero para adaptar o manequim de loja
                </p>
              </CardContent>
            </Card>

            <div className="p-4 bg-[#1a4d3a]/40 border border-gold/20 rounded-lg">
              <p className="text-sm text-gold font-semibold mb-2">
                Você receberá 2 variações:
              </p>
              <ul className="text-xs text-gold/70 font-light space-y-2">
                <li className="flex items-start">
                  <span className="text-gold-bright mr-2">1.</span>
                  <span>Avatar vestindo a peça (foto real da pessoa)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold-bright mr-2">2.</span>
                  <span>Manequim de loja com a peça (apresentação profissional)</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!productImage || !personImage || isGenerating}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando 2 Variações...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar 2 Variações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
