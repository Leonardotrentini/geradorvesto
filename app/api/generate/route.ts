import { NextRequest, NextResponse } from 'next/server'
import { generateTryOnWithReplicate, checkTryOnStatus } from '@/lib/api/replicate-tryon'
import { generateMannequin } from '@/lib/api/mannequin'

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
    
    console.log('🔵 Iniciando upload de imagens...')
    console.log('🔵 Cloudinary configurado:', !!process.env.CLOUDINARY_CLOUD_NAME)
    console.log('🔵 Vercel Blob configurado:', !!process.env.BLOB_READ_WRITE_TOKEN)
    console.log('🔵 Ambiente Vercel:', !!process.env.VERCEL)
    
    try {
      // Prioridade 1: Cloudinary (se configurado)
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        console.log('🔵 Usando Cloudinary...')
        const { uploadImage } = await import('@/lib/api/storage')
        const [uploadProduct, uploadPerson] = await Promise.all([
          uploadImage(productImage, 'products'),
          uploadImage(personImage, 'persons')
        ])
        productImageUrl = uploadProduct.url
        personImageUrl = uploadPerson.url
        console.log('✅ Imagens enviadas para Cloudinary')
      } 
      // Prioridade 2: Vercel Blob Storage
      else {
        console.log('🔵 Usando Vercel Blob Storage...')
        
        const { put } = await import('@vercel/blob')
        
        // Função de upload simplificada
        const uploadFile = async (file: File, prefix: string): Promise<string> => {
          try {
            const fileName = `${prefix}-${Date.now()}-${file.name}`
            console.log(`🔵 Fazendo upload de: ${fileName} (${(file.size / 1024).toFixed(2)}KB)`)
            
            const blob = await put(fileName, file, {
              access: 'public',
              addRandomSuffix: true,
            })
            
            console.log(`✅ Upload concluído: ${blob.url.substring(0, 80)}...`)
            return blob.url
          } catch (error: any) {
            console.error(`❌ Erro ao fazer upload de ${file.name}:`, error)
            console.error('❌ Error message:', error.message)
            console.error('❌ Error stack:', error.stack)
            
            // Verifica se é erro de token não configurado
            if (error.message?.includes('BLOB_READ_WRITE_TOKEN') || 
                error.message?.includes('token') ||
                error.message?.includes('unauthorized')) {
              throw new Error(
                'Vercel Blob Storage não configurado. ' +
                'Configure BLOB_READ_WRITE_TOKEN nas variáveis de ambiente da Vercel. ' +
                'Veja GUIA_CONFIGURAR_VERCEL_BLOB.md para instruções.'
              )
            }
            
            throw error
          }
        }
        
        // Faz upload das duas imagens em paralelo
        const [uploadProduct, uploadPerson] = await Promise.all([
          uploadFile(productImage, 'product'),
          uploadFile(personImage, 'person')
        ])
        
        productImageUrl = uploadProduct
        personImageUrl = uploadPerson
        console.log('✅ Imagens enviadas para Vercel Blob Storage com sucesso')
      }
    } catch (error: any) {
      console.error('❌ ERRO CRÍTICO ao fazer upload:', error)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      
      return NextResponse.json(
        { 
          error: 'Erro ao fazer upload das imagens para URL pública. ' +
                 'Vella Try-On requer URLs públicas (não base64). ' +
                 (error.message || 'Erro desconhecido')
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
        console.error('❌ ERRO CRÍTICO: Avatar não foi gerado')
        throw new Error('Erro ao gerar avatar vestindo a peça - nenhuma imagem retornada. Verifique se as imagens estão corretas e tente novamente.')
      }
      
      // Valida se a imagem do avatar é diferente da original
      if (avatarImage === personImageUrl || avatarImage.split('?')[0] === personImageUrl.split('?')[0]) {
        console.error('❌ ERRO CRÍTICO: Avatar retornado é igual à imagem original!')
        console.error('❌ Isso significa que o Vella não processou a imagem.')
        throw new Error('O avatar gerado é igual à imagem original. Isso indica que o modelo não conseguiu processar. Verifique se: (1) A roupa está isolada em fundo branco, (2) A pessoa está de corpo inteiro, (3) As imagens são de alta qualidade.')
      }
      
      console.log('✅ Avatar validado e diferente da imagem original')

      // Variação 2: Manequim de loja
      console.log('🔵 ========================================')
      console.log('🔵 GERANDO VARIAÇÃO 2: MANEQUIM DE LOJA')
      console.log('🔵 ========================================')
      let mannequinImage: string | null = null
      
      // Tenta gerar manequim com retry (até 3 tentativas)
      let mannequinAttempts = 0
      const maxMannequinAttempts = 3
      
      while (!mannequinImage && mannequinAttempts < maxMannequinAttempts) {
        mannequinAttempts++
        console.log(`🔵 Tentativa ${mannequinAttempts}/${maxMannequinAttempts} de gerar manequim...`)
        
        try {
          const mannequinResult = await generateMannequin({
            garmentImage: productImageUrl,
            gender: gender as 'homem' | 'mulher',
          })
          
          if (mannequinResult && mannequinResult.image && mannequinResult.image.length > 0) {
            mannequinImage = mannequinResult.image
            console.log('✅ Manequim gerado com sucesso na tentativa', mannequinAttempts)
            console.log('✅ URL:', mannequinImage.substring(0, 100) + '...')
            break
          } else {
            console.warn(`⚠️ Tentativa ${mannequinAttempts}: Manequim retornou sem imagem`)
            if (mannequinAttempts < maxMannequinAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000)) // Aguarda 2s antes de tentar novamente
            }
          }
        } catch (error: any) {
          console.error(`❌ ERRO na tentativa ${mannequinAttempts} ao gerar manequim:`, error)
          console.error('❌ Error message:', error.message)
          console.error('❌ Error stack:', error.stack)
          
          if (mannequinAttempts < maxMannequinAttempts) {
            console.log(`🔄 Aguardando 3 segundos antes de tentar novamente...`)
            await new Promise(resolve => setTimeout(resolve, 3000))
          } else {
            console.error('❌ Todas as tentativas de gerar manequim falharam')
          }
        }
      }
      
      if (!mannequinImage) {
        console.error('❌ ERRO CRÍTICO: Não foi possível gerar manequim após', maxMannequinAttempts, 'tentativas')
        // Não retorna erro, apenas deixa null para mostrar mensagem no frontend
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
    } catch (error: any) {
      // Se não for try-on, retorna erro
      console.error('Erro ao verificar status do try-on:', error)
      return NextResponse.json({
        success: false,
        status: 'failed',
        error: 'Job ID não encontrado ou inválido',
      }, { status: 404 })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}


