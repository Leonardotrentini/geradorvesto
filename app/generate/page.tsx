'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImageDropzone } from '@/components/upload/ImageDropzone'
import { GenderSelector } from '@/components/avatar/GenderSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Gender } from '@/types/avatar'
import { Sparkles, Loader2 } from 'lucide-react'
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
