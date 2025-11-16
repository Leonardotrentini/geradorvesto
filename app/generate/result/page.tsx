'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ResultGrid } from '@/components/generation/ResultGrid'
import { ProgressBar } from '@/components/generation/ProgressBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, ArrowLeft, Sparkles, Share2, MessageCircle, Facebook, Instagram } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { downloadImage, downloadImagesAsZip } from '@/lib/utils/download'
import { shareOnWhatsApp, shareOnFacebook, shareOnInstagram, copyLinkToClipboard, generateShareLink } from '@/lib/utils/share'

export default function ResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const resultId = searchParams.get('id')
  const jobId = searchParams.get('jobId')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string>('Iniciando...')

  // Polling para verificar status da geração
  useEffect(() => {
    if (!jobId) {
      if (resultId) {
        // Se tem resultId mas não jobId, busca do sessionStorage
        try {
          const saved = sessionStorage.getItem('lastGeneration')
          if (saved) {
            const savedData = JSON.parse(saved)
            if (savedData.id === resultId) {
              setLoading(false)
              setResult({
                id: savedData.id,
                images: savedData.images || [],
              })
              return
            }
          }
        } catch (error) {
          console.error('Erro ao buscar resultado salvo:', error)
        }
        
        // Se não encontrou, redireciona
        setLoading(false)
        toast.error('Resultado não encontrado. Gere novamente.', { id: 'generating' })
        router.push('/generate')
      } else {
        setLoading(false)
      }
      return
    }

    let pollInterval: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/generate?jobId=${jobId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao verificar status')
        }

        if (data.status === 'succeeded' && data.output) {
          // Geração completa!
          clearInterval(pollInterval)
          clearInterval(progressInterval)
          setProgress(100)
          setStatus('Concluído!')
          setLoading(false)
          
          console.log('Result data:', data)
          console.log('Output:', data.output)
          
          const images = Array.isArray(data.output) ? data.output : [data.output]
          console.log('Processed images:', images)
          
          // Garante que todas as imagens são strings (URLs)
          const imageUrls = images
            .filter((img: any) => img && (typeof img === 'string' || img.url))
            .map((img: any) => typeof img === 'string' ? img : (img.url || String(img)))
          
          console.log('Final image URLs:', imageUrls)
          
          // Se gerou menos de 4, duplica para ter 4 variações
          while (imageUrls.length < 4 && imageUrls.length > 0) {
            imageUrls.push(imageUrls[0])
          }
          
          setResult({
            id: `gen_${Date.now()}`,
            images: imageUrls.slice(0, 4),
          })
          
          toast.success('Imagens geradas com sucesso!', { id: 'generating' })
        } else if (data.status === 'failed' || data.status === 'canceled') {
          // Erro na geração
          clearInterval(pollInterval)
          clearInterval(progressInterval)
          setLoading(false)
          toast.error(data.error || 'Erro ao gerar imagens', { id: 'generating' })
          router.push('/generate')
        } else if (data.status === 'starting' || data.status === 'processing') {
          // Ainda processando
          if (data.status === 'starting') {
            setStatus('Iniciando geração...')
            setProgress(10)
          } else if (data.status === 'processing') {
            const currentProgress = progress
            if (currentProgress < 30) {
              setStatus('Processando avatar vestindo a peça...')
            } else if (currentProgress < 70) {
              setStatus('Gerando manequim de loja...')
            } else {
              setStatus('Finalizando geração...')
            }
            setProgress((prev) => Math.min(prev + 5, 90))
          }
        }
      } catch (error: any) {
        console.error('Erro ao verificar status:', error)
        // Continua tentando
      }
    }

    // Verifica status imediatamente
    checkStatus()

    // Polling a cada 3 segundos
    pollInterval = setInterval(checkStatus, 3000)

    // Simula progresso visual
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + 1
      })
    }, 500)

    return () => {
      clearInterval(pollInterval)
      clearInterval(progressInterval)
    }
  }, [jobId, resultId, router])

  const handleDownloadAll = async () => {
    if (!result?.images || result.images.length === 0) return

    toast.loading('Preparando ZIP...', { id: 'download' })

    try {
      const filenames = [
        'avatar-vestindo-peca.jpg',
        'manequim-loja.jpg',
      ]
      
      await downloadImagesAsZip(
        result.images.filter(img => img), // Remove nulls
        filenames.slice(0, result.images.filter(img => img).length),
        `vesto-geracao-${result.id}.zip`
      )
      
      toast.success('Download concluído!', { id: 'download' })
    } catch (error: any) {
      console.error('Erro ao baixar ZIP:', error)
      toast.error(error.message || 'Erro ao baixar imagens', { id: 'download' })
    }
  }

  const handleDownloadImage = async (imageUrl: string, index: number) => {
    try {
      const filename = index === 0 
        ? 'avatar-vestindo-peca.jpg' 
        : 'manequim-loja.jpg'
      
      await downloadImage(imageUrl, filename)
      toast.success('Download concluído!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao baixar imagem')
    }
  }

  const handleShare = async (platform: 'whatsapp' | 'facebook' | 'instagram' | 'copy') => {
    const shareUrl = generateShareLink(result.id)
    const shareText = 'Confira esta geração de moda criada com VESTO co.!'

    try {
      switch (platform) {
        case 'whatsapp':
          shareOnWhatsApp({ url: shareUrl, text: shareText })
          toast.success('Abrindo WhatsApp...')
          break
        case 'facebook':
          shareOnFacebook({ url: shareUrl, text: shareText })
          toast.success('Abrindo Facebook...')
          break
        case 'instagram':
          // Instagram precisa de download manual
          if (result.images[0]) {
            await handleDownloadImage(result.images[0], 0)
            toast.success('Imagem baixada! Agora você pode fazer upload no Instagram')
          }
          break
        case 'copy':
          await copyLinkToClipboard(shareUrl)
          toast.success('Link copiado para a área de transferência!')
          break
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao compartilhar')
    }
  }

  // Salva no histórico ao carregar
  useEffect(() => {
    if (result && result.images && result.images.length > 0) {
      try {
        const historyKey = 'vesto-generation-history'
        const existingHistory = sessionStorage.getItem(historyKey)
        const history = existingHistory ? JSON.parse(existingHistory) : []
        
        // Adiciona no início (mais recente primeiro)
        const newEntry = {
          id: result.id,
          images: result.images,
          createdAt: new Date().toISOString(),
        }
        
        // Remove duplicatas e limita a 10
        const filteredHistory = history.filter((h: any) => h.id !== result.id)
        const updatedHistory = [newEntry, ...filteredHistory].slice(0, 10)
        
        sessionStorage.setItem(historyKey, JSON.stringify(updatedHistory))
      } catch (error) {
        console.error('Erro ao salvar histórico:', error)
      }
    }
  }, [result])

  if (loading) {
    return (
      <div className="min-h-screen bg-vesto-green py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-gold animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-gold">Gerando suas imagens...</h2>
                  <p className="text-gold/70 font-light mb-1">{status}</p>
                  <p className="text-xs text-gold/50 font-light">
                    Isso pode levar de 30 segundos a 2 minutos
                  </p>
                </div>
                <ProgressBar progress={progress} status={status} />
                <div className="mt-4 space-y-2 text-sm text-gold/60">
                  <p className="font-light">✨ Gerando 2 variações profissionais</p>
                  <p className="font-light">⏳ Aguarde enquanto processamos suas imagens</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-vesto-green py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gold">Resultado não encontrado</h2>
              <Link href="/generate">
                <Button>Voltar para Gerador</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vesto-green py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Link href="/generate">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Gerar Novamente
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleShare('whatsapp')}
              className="bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare('facebook')}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare('copy')}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Copiar Link
            </Button>
            <Button onClick={handleDownloadAll}>
              <Download className="w-4 h-4 mr-2" />
              Baixar ZIP
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suas 2 Variações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gold">1. Avatar Vestindo a Peça</h3>
                  {result.images[0] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadImage(result.images[0], 0)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {result.images[0] && (
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold/30 group">
                      <img
                        src={result.images[0]}
                        alt="Avatar vestindo a peça"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownloadImage(result.images[0], 0)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gold">2. Manequim de Loja</h3>
                  {result.images[1] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadImage(result.images[1], 1)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {result.images[1] ? (
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold/30 group">
                      <img
                        src={result.images[1]}
                        alt="Manequim de loja com a peça"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownloadImage(result.images[1], 1)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold/30 bg-[#1a4d3a]/40 flex items-center justify-center">
                      <p className="text-gold/50 text-center p-4">
                        Manequim não foi gerado. Tente novamente.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


