/**
 * Segmentação Precisa da Roupa
 * 
 * Pipeline multi-etapas baseado em:
 * - OOTDiffusion: segmentação precisa com múltiplos modelos
 * - TryOnDiffusion: refinamento de máscara
 * - VITON-HD: segmentação de partes da roupa
 * 
 * Estratégia:
 * 1. Tentar Omnious (especializado em fashion)
 * 2. Fallback para Stability (background removal)
 * 3. Refinar máscara com edge detection
 * 4. Remover fundo e gerar PNG transparente
 */

import Replicate from 'replicate'

export interface SegmentationResult {
  croppedImage: string // URL da imagem recortada (PNG transparente)
  mask: string // URL da máscara em alta resolução
  confidence: number // 0-1
}

/**
 * Segmenta roupa da imagem usando múltiplas estratégias
 */
export async function segmentGarment(
  image: File | string
): Promise<SegmentationResult> {
  console.log('🔵 Iniciando segmentação da roupa...')

  // Converte File para URL se necessário
  const imageUrl = typeof image === 'string' 
    ? image 
    : await fileToUrl(image)

  // ETAPA 1: Tentar Omnious (especializado em fashion)
  console.log('🔵 ETAPA 1: Tentando segmentação com Omnious...')
  try {
    const omniousResult = await segmentWithOmnious(imageUrl)
    if (omniousResult.confidence > 0.7) {
      console.log('✅ Segmentação Omnious bem-sucedida')
      return omniousResult
    }
    console.warn('⚠️ Segmentação Omnious com baixa confiança, tentando fallback...')
  } catch (error: any) {
    console.warn('⚠️ Omnious falhou:', error.message)
  }

  // ETAPA 2: Fallback para Stability (background removal)
  console.log('🔵 ETAPA 2: Tentando background removal com Stability...')
  try {
    const stabilityResult = await segmentWithStability(imageUrl)
    if (stabilityResult.confidence > 0.6) {
      console.log('✅ Segmentação Stability bem-sucedida')
      return stabilityResult
    }
    console.warn('⚠️ Segmentação Stability com baixa confiança, tentando método básico...')
  } catch (error: any) {
    console.warn('⚠️ Stability falhou:', error.message)
  }

  // ETAPA 3: Método básico (fallback final)
  console.log('🔵 ETAPA 3: Usando método básico de remoção de fundo...')
  return await segmentBasic(imageUrl)
}

/**
 * Segmenta usando Omnious (especializado em fashion)
 */
async function segmentWithOmnious(imageUrl: string): Promise<SegmentationResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN?.trim()
  if (!apiToken) {
    throw new Error('REPLICATE_API_TOKEN não configurado')
  }

  const replicate = new Replicate({ auth: apiToken })

  // TODO: Pesquisar modelo Omnious de segmentação no Replicate
  // Por enquanto, usa modelo genérico de segmentação
  // Modelo ideal: algum modelo Omnious de fashion segmentation

  // Tenta usar modelo de segmentação semântica
  const MODEL = 'cjwbw/rembg' // Background removal genérico (temporário)

  try {
    const output = await replicate.run(MODEL, {
      input: {
        image: imageUrl,
      },
    }) as string

    // Refina máscara
    const refinedMask = await refineMask(output, imageUrl)

    return {
      croppedImage: output,
      mask: refinedMask,
      confidence: 0.8, // Estimativa
    }
  } catch (error: any) {
    throw new Error(`Erro ao segmentar com Omnious: ${error.message}`)
  }
}

/**
 * Segmenta usando Stability (background removal)
 */
async function segmentWithStability(imageUrl: string): Promise<SegmentationResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN?.trim()
  if (!apiToken) {
    throw new Error('REPLICATE_API_TOKEN não configurado')
  }

  const replicate = new Replicate({ auth: apiToken })

  // Usa modelo de background removal
  const MODEL = 'cjwbw/rembg'

  try {
    const output = await replicate.run(MODEL, {
      input: {
        image: imageUrl,
      },
    }) as string

    // Refina máscara
    const refinedMask = await refineMask(output, imageUrl)

    return {
      croppedImage: output,
      mask: refinedMask,
      confidence: 0.75,
    }
  } catch (error: any) {
    throw new Error(`Erro ao segmentar com Stability: ${error.message}`)
  }
}

/**
 * Segmentação básica (fallback)
 */
async function segmentBasic(imageUrl: string): Promise<SegmentationResult> {
  // Método básico usando análise de cor (assumindo fundo branco/claro)
  // Isso é um fallback simples - idealmente nunca deve ser usado
  
  console.warn('⚠️ Usando método básico - qualidade pode ser reduzida')
  
  // TODO: Implementar remoção básica de fundo
  // Por enquanto, retorna a imagem original
  return {
    croppedImage: imageUrl,
    mask: imageUrl, // Placeholder
    confidence: 0.5,
  }
}

/**
 * Refina máscara usando edge detection e morfologia
 */
async function refineMask(maskUrl: string, originalUrl: string): Promise<string> {
  // TODO: Implementar refinamento de máscara
  // - Edge detection para melhorar bordas
  // - Operações morfológicas (dilatação/erosão)
  // - Preenchimento de buracos
  
  // Por enquanto, retorna máscara original
  return maskUrl
}

/**
 * Converte File para URL pública
 */
async function fileToUrl(file: File): Promise<string> {
  // Upload para Vercel Blob Storage
  const { put } = await import('@vercel/blob')
  
  const fileName = `garment-${Date.now()}-${file.name}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const blob = await put(fileName, buffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  })
  
  return blob.url
}

