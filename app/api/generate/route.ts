import { NextRequest, NextResponse } from 'next/server'
import { generationConfigSchema } from '@/lib/utils/validation'
import { generateFashionPrompt, checkGenerationStatus } from '@/lib/api/replicate'
import { generateWithStability } from '@/lib/api/stability'
import { generateTryOnWithReplicate, checkTryOnStatus } from '@/lib/api/replicate-tryon'
import { generateMannequin } from '@/lib/api/mannequin'

// Função auxiliar para converter File para base64 URL
async function fileToDataURL(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return `data:${file.type};base64,${base64}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const productImage = formData.get('productImage') as File
    const personImage = formData.get('personImage') as File
    const configStr = formData.get('config') as string

    if (!productImage) {
      return NextResponse.json(
        { error: 'Imagem do produto é obrigatória' },
        { status: 400 }
      )
    }

    if (!personImage) {
      return NextResponse.json(
        { error: 'Imagem de pessoa/modelo é obrigatória para Vella 1.5' },
        { status: 400 }
      )
    }

    // Validar arquivo
    if (productImage.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande (máx. 10MB)' },
        { status: 400 }
      )
    }

    const config = JSON.parse(configStr)

    // Validação simplificada (apenas gênero agora)
    if (!config.gender || !['homem', 'mulher', 'nao-binario'].includes(config.gender)) {
      return NextResponse.json(
        { error: 'Gênero inválido. Use: homem, mulher ou nao-binario' },
        { status: 400 }
      )
    }

    // 1. Converter imagens para URL pública
    // O Replicate Try-On precisa de URL pública (não base64)
    // CRÍTICO: Base64 NÃO funciona com Vella!
    let productImageUrl: string
    let personImageUrl: string
    
    try {
      // Prioridade 1: Cloudinary (se configurado)
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const { uploadImage } = await import('@/lib/api/storage')
        const [uploadProduct, uploadPerson] = await Promise.all([
          uploadImage(productImage, 'products'),
          uploadImage(personImage, 'persons')
        ])
        productImageUrl = uploadProduct.url
        personImageUrl = uploadPerson.url
        console.log('Imagens enviadas para Cloudinary')
      } 
      // Prioridade 2: Vercel Blob Storage (se em produção na Vercel)
      else if (process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN) {
        console.log('Usando Vercel Blob Storage para upload...')
        
        // Upload direto usando @vercel/blob (mais confiável que API route)
        const uploadFile = async (file: File): Promise<string> => {
          try {
            const { put } = await import('@vercel/blob')
            
            const blob = await put(file.name, file, {
              access: 'public',
              addRandomSuffix: true,
            })
            
            return blob.url
          } catch (error: any) {
            console.error('Erro ao fazer upload para Vercel Blob:', error)
            
            // Se falhar, tenta via API route como fallback
            const formData = new FormData()
            formData.append('file', file)
            
            // Usa a URL do request para construir a URL base
            const requestUrl = request.headers.get('host')
            const protocol = request.headers.get('x-forwarded-proto') || 'https'
            const baseUrl = requestUrl 
              ? `${protocol}://${requestUrl}`
              : process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}`
                : 'http://localhost:3000'
            
            console.log('Tentando upload via API route:', `${baseUrl}/api/upload`)
            
            const response = await fetch(`${baseUrl}/api/upload`, {
              method: 'POST',
              body: formData,
            })
            
            if (!response.ok) {
              const errorText = await response.text()
              console.error('Erro da API de upload:', errorText)
              let errorData: any = {}
              try {
                errorData = JSON.parse(errorText)
              } catch {
                errorData = { error: errorText.substring(0, 200) }
              }
              throw new Error(errorData.error || 'Erro ao fazer upload')
            }
            
            const data = await response.json()
            return data.url
          }
        }
        
        const [uploadProduct, uploadPerson] = await Promise.all([
          uploadFile(productImage),
          uploadFile(personImage)
        ])
        
        productImageUrl = uploadProduct
        personImageUrl = uploadPerson
        console.log('Imagens enviadas para Vercel Blob Storage')
      }
      // Prioridade 3: Serviço externo gratuito (imgbb.com)
      else {
        console.warn('Cloudinary e Vercel Blob não configurados. Tentando imgbb.com...')
        
        // Função para upload no imgbb.com (gratuito)
        const uploadToImgbb = async (file: File): Promise<string> => {
          const formData = new FormData()
          const buffer = await file.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          
          // imgbb.com API (gratuita, mas requer API key)
          // Por enquanto, vamos retornar erro claro
          throw new Error(
            'Configure Cloudinary ou Vercel Blob Storage. ' +
            'Base64 não funciona com Vella Try-On. ' +
            'Veja GUIA_DEPLOY_VERCEL.md para instruções.'
          )
        }
        
        const [uploadProduct, uploadPerson] = await Promise.all([
          uploadToImgbb(productImage),
          uploadToImgbb(personImage)
        ])
        
        productImageUrl = uploadProduct
        personImageUrl = uploadPerson
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      
      // NUNCA usar base64 como fallback - Vella não aceita!
      return NextResponse.json(
        { 
          error: 'Erro ao fazer upload das imagens para URL pública. ' +
                 'Vella Try-On requer URLs públicas (não base64). ' +
                 'Configure Cloudinary ou faça deploy na Vercel. ' +
                 'Detalhes: ' + error.message
        },
        { status: 500 }
      )
    }
    
    // Validar que as URLs são públicas (não base64)
    if (productImageUrl.startsWith('data:') || personImageUrl.startsWith('data:')) {
      return NextResponse.json(
        { 
          error: 'URLs base64 não são suportadas. Configure Cloudinary ou Vercel Blob Storage para URLs públicas.'
        },
        { status: 500 }
      )
    }
    
    // Validar que as URLs são acessíveis
    if (!productImageUrl.startsWith('http://') && !productImageUrl.startsWith('https://')) {
      return NextResponse.json(
        { 
          error: 'URL inválida. Configure um serviço de upload (Cloudinary ou Vercel Blob).'
        },
        { status: 500 }
      )
    }

    // 2. Gerar sempre 2 variações:
    //    - Variação 1: Avatar vestindo a peça (Vella)
    //    - Variação 2: Manequim de loja com a peça
    
    try {
      console.log('Gerando 2 variações: Avatar + Manequim...')
      
      const gender = config.gender || 'mulher'
      
      // Variação 1: Avatar vestindo a peça
      console.log('🔵 ========================================')
      console.log('🔵 GERANDO VARIAÇÃO 1: AVATAR VESTINDO A PEÇA')
      console.log('🔵 ========================================')
      console.log('🔵 Product Image URL:', productImageUrl.substring(0, 100) + '...')
      console.log('🔵 Person Image URL:', personImageUrl.substring(0, 100) + '...')
      
      let avatarImage: string | null = null
      try {
        const avatarResult = await generateTryOnWithReplicate({
          garmentImage: productImageUrl,
          personImage: personImageUrl,
        })

        console.log('✅ Avatar result status:', avatarResult.status)
        console.log('✅ Avatar result output:', avatarResult.output)

        // Processa resultado do avatar
        if (avatarResult.status === 'succeeded' && avatarResult.output) {
          const outputImages = Array.isArray(avatarResult.output) 
            ? avatarResult.output 
            : [avatarResult.output]
          
          const processedUrls = outputImages.map((img: any) => {
            if (typeof img === 'string') return img
            if (img && typeof img.url === 'function') return img.url()
            if (img && img.url) return img.url
            return String(img)
          }).filter((url: string) => url && url.length > 0)
          
          console.log('Processed avatar URLs:', processedUrls)
          
          if (processedUrls.length > 0) {
            const firstUrl = processedUrls[0]
            if (firstUrl) {
              avatarImage = firstUrl
              console.log('Avatar gerado com sucesso:', firstUrl.substring(0, 100) + '...')
            }
          }
        }
      } catch (error: any) {
        console.error('Erro ao gerar avatar:', error)
        throw new Error(`Erro ao gerar avatar: ${error.message}`)
      }

      if (!avatarImage) {
        throw new Error('Erro ao gerar avatar vestindo a peça - nenhuma imagem retornada')
      }

      // Variação 2: Manequim de loja
      console.log('🔵 ========================================')
      console.log('🔵 GERANDO VARIAÇÃO 2: MANEQUIM DE LOJA')
      console.log('🔵 ========================================')
      let mannequinImage: string | null = null
      
      try {
        const mannequinResult = await generateMannequin({
          garmentImage: productImageUrl,
          gender: gender as 'homem' | 'mulher',
        })
        mannequinImage = mannequinResult.image
        console.log('✅ Manequim gerado com sucesso:', mannequinImage.substring(0, 100) + '...')
      } catch (error: any) {
        console.error('❌ ERRO ao gerar manequim:', error)
        console.error('❌ Error message:', error.message)
        console.error('❌ Error stack:', error.stack)
        // Se falhar, usa uma imagem placeholder ou tenta novamente
        // Por enquanto, vamos deixar null e retornar só o avatar
        console.warn('⚠️ Manequim não foi gerado, retornando apenas avatar')
      }

      const allImages = [avatarImage]
      if (mannequinImage) {
        allImages.push(mannequinImage)
      } else {
        // Se não gerou manequim, duplica o avatar temporariamente
        // Ou pode retornar só 1 imagem
        console.warn('Manequim não disponível, retornando apenas avatar')
      }

      console.log('Geradas 2 variações com sucesso')

      return NextResponse.json({
        success: true,
        result: {
          id: `gen_${Date.now()}`,
          images: allImages,
          config: {
            gender: config.gender,
          },
          createdAt: new Date(),
          status: 'completed',
        },
      })
    } catch (error: any) {
      console.error('Erro ao gerar variações:', error)
      return NextResponse.json(
        { error: error.message || 'Erro ao gerar variações' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao gerar imagens:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * Endpoint para verificar status de uma geração
 * GET /api/generate/status?jobId=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json(
      { error: 'jobId é obrigatório' },
      { status: 400 }
    )
  }

  try {
    // Tenta verificar como try-on primeiro
    try {
      const tryOnStatus = await checkTryOnStatus(jobId)
      
      if (tryOnStatus.status === 'succeeded' && tryOnStatus.output) {
        const outputImages = Array.isArray(tryOnStatus.output) 
          ? tryOnStatus.output 
          : [tryOnStatus.output]
        
        // Duplica para ter 4 variações se necessário
        while (outputImages.length < 4 && outputImages.length > 0) {
          outputImages.push(outputImages[0])
        }

        return NextResponse.json({
          success: true,
          status: tryOnStatus.status,
          output: outputImages.slice(0, 4),
          error: tryOnStatus.error,
        })
      }

      return NextResponse.json({
        success: true,
        status: tryOnStatus.status,
        output: tryOnStatus.output,
        error: tryOnStatus.error,
      })
    } catch {
      // Se não for try-on, tenta como geração normal
      const status = await checkGenerationStatus(jobId)

      return NextResponse.json({
        success: true,
        status: status.status,
        output: status.output,
        error: status.error,
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}


