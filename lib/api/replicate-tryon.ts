/**
 * Integração com Replicate para Virtual Try-On
 * Preserva a peça de roupa exata e veste em um avatar
 * 
 * Usa a biblioteca cliente oficial do Replicate
 * Modelo: omnious/vella-1.5
 */

import Replicate from 'replicate'

export interface TryOnRequest {
  garmentImage: string // URL pública da foto da roupa (obrigatório)
  personImage: string // URL pública de foto de pessoa (obrigatório para Vella)
  prompt?: string // Descrição do avatar (opcional)
}

export interface TryOnResponse {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string | string[]
  error?: string
  urls?: {
    get: string
    cancel: string
  }
}

// Modelo Vella 1.5 - Virtual Try-On
// Custo: $0.03 por imagem gerada
// Precisa de: top_image/dress_image (roupa) + model_image (pessoa) - OBRIGATÓRIO
const MODEL_NAME = 'omnious/vella-1.5'

/**
 * Obtém a versão mais recente do modelo Vella
 */
async function getVellaVersion(replicate: Replicate): Promise<string> {
  try {
    const model = await replicate.models.get('omnious', 'vella-1.5')
    const latestVersion = model.latest_version
    if (!latestVersion) {
      throw new Error('Não foi possível obter versão do modelo')
    }
    console.log('🔵 Versão do Vella:', latestVersion.id)
    return latestVersion.id
  } catch (error: any) {
    console.warn('⚠️ Não foi possível obter versão, usando nome do modelo:', error.message)
    // Fallback: tenta usar o nome do modelo diretamente
    throw new Error('Não foi possível obter versão do modelo Vella. Verifique sua conexão.')
  }
}

/**
 * Gera avatar vestindo a peça usando Vella 1.5
 * Este modelo preserva a peça de roupa exata
 */
export async function generateTryOnWithReplicate(
  request: TryOnRequest
): Promise<TryOnResponse> {
  const apiToken = process.env.REPLICATE_API_TOKEN?.trim()

  if (!apiToken || apiToken.length === 0) {
    throw new Error('REPLICATE_API_TOKEN não configurado')
  }

  // Inicializa o cliente Replicate
  const replicate = new Replicate({
    auth: apiToken,
  })

  // Vella 1.5 precisa de:
  // - top_image OU dress_image (imagem da roupa)
  // - model_image (imagem da pessoa) - OBRIGATÓRIO
  
  console.log('🔵 Vella Try-On - Iniciando geração...')
  console.log('🔵 Garment Image URL:', request.garmentImage?.substring(0, 100) + '...')
  console.log('🔵 Person Image URL:', request.personImage?.substring(0, 100) + '...')
  
  // VALIDAÇÃO CRÍTICA: Verificar se URLs são acessíveis
  try {
    console.log('🔵 Validando URLs antes de enviar...')
    const [garmentCheck, personCheck] = await Promise.all([
      fetch(request.garmentImage, { method: 'HEAD' }).catch(() => null),
      fetch(request.personImage, { method: 'HEAD' }).catch(() => null),
    ])
    
    if (!garmentCheck || !garmentCheck.ok) {
      throw new Error(`URL da roupa não é acessível: ${request.garmentImage}`)
    }
    if (!personCheck || !personCheck.ok) {
      throw new Error(`URL da pessoa não é acessível: ${request.personImage}`)
    }
    console.log('✅ URLs validadas e acessíveis')
  } catch (validationError: any) {
    console.error('❌ Erro na validação de URLs:', validationError)
    throw new Error(`Erro ao validar URLs: ${validationError.message}`)
  }
  
  // Detectar tipo de roupa baseado na URL (tentativa simples)
  // Se contém "dress" ou "vestido", usa dress_image, senão top_image
  const isDress = request.garmentImage.toLowerCase().includes('dress') || 
                  request.garmentImage.toLowerCase().includes('vestido')
  
  const input: any = {
    // Vella aceita top_image (camisa/blusa) ou dress_image (vestido)
    // Tenta detectar automaticamente, mas usa top_image por padrão
    ...(isDress ? { dress_image: request.garmentImage } : { top_image: request.garmentImage }),
    
    // model_image é OBRIGATÓRIO para Vella
    model_image: request.personImage,
  }

  try {
    console.log('🔵 Enviando requisição para Vella 1.5...')
    console.log('🔵 Tipo detectado:', isDress ? 'dress' : 'top')
    console.log('🔵 Input completo:', JSON.stringify(input, null, 2))
    
    // CRÍTICO: Usar processamento assíncrono para garantir que o modelo processe corretamente
    // O Vella pode precisar de mais tempo e retornar erro se tentarmos síncrono
    console.log('🔵 Criando predição assíncrona...')
    const prediction = await replicate.predictions.create({
      version: await getVellaVersion(replicate),
      input,
    })
    
    console.log('🔵 Prediction ID:', prediction.id)
    console.log('🔵 Prediction status inicial:', prediction.status)
    
    // Polling até completar (máximo 2 minutos)
    let finalPrediction = prediction
    const maxAttempts = 60 // 60 tentativas de 2 segundos = 2 minutos
    let attempts = 0
    
    while (finalPrediction.status !== 'succeeded' && finalPrediction.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Aguarda 2 segundos
      finalPrediction = await replicate.predictions.get(prediction.id)
      attempts++
      console.log(`🔵 Tentativa ${attempts}/${maxAttempts} - Status: ${finalPrediction.status}`)
    }
    
    if (finalPrediction.status === 'failed') {
      throw new Error(`Vella falhou: ${finalPrediction.error || 'Erro desconhecido'}`)
    }
    
    if (finalPrediction.status !== 'succeeded') {
      throw new Error(`Vella não completou a tempo. Status: ${finalPrediction.status}`)
    }
    
    const output = finalPrediction.output

    console.log('✅ Vella retornou resultado')
    console.log('🔵 Output raw:', output)
    console.log('🔵 Output type:', typeof output)
    console.log('🔵 Is array:', Array.isArray(output))
    console.log('🔵 Output length:', Array.isArray(output) ? output.length : 'N/A')

    // A biblioteca pode retornar:
    // - String (URL direta)
    // - Array de strings (múltiplas URLs)
    // - Array de objetos com .url()
    // - Objeto com método .url()
    
    let outputUrls: string[] = []
    
    if (Array.isArray(output)) {
      outputUrls = output.map((item: any) => {
        // Se for string, usa direto
        if (typeof item === 'string') return item
        // Se tiver método url(), chama
        if (item && typeof item.url === 'function') return item.url()
        // Se for objeto com url, pega a propriedade
        if (item && item.url) return item.url
        // Se for objeto, tenta converter para string
        return String(item)
      })
    } else if (output) {
      // Se não for array, trata como único resultado
      if (typeof output === 'string') {
        outputUrls = [output]
      } else if (output && typeof (output as any).url === 'function') {
        outputUrls = [(output as any).url()]
      } else if (output && (output as any).url) {
        outputUrls = [(output as any).url]
      } else {
        outputUrls = [String(output)]
      }
    }

    console.log('🔵 Processed URLs:', outputUrls)
    console.log('🔵 Total de URLs processadas:', outputUrls.length)

    if (outputUrls.length === 0) {
      console.error('❌ ERRO: Vella não retornou nenhuma URL!')
      throw new Error('Vella não retornou nenhuma imagem. Verifique se as URLs das imagens são públicas e acessíveis.')
    }

    // VALIDAÇÃO CRÍTICA: Verificar se a primeira URL é diferente da imagem original da pessoa
    const firstUrl = outputUrls[0]
    
    // Compara URLs (sem query params)
    const cleanFirstUrl = firstUrl.split('?')[0]
    const cleanPersonUrl = request.personImage.split('?')[0]
    
    if (cleanFirstUrl === cleanPersonUrl || firstUrl === request.personImage) {
      console.error('❌ ERRO CRÍTICO: URL retornada é igual à imagem original da pessoa!')
      console.error('❌ Isso significa que o Vella NÃO processou a imagem.')
      console.error('❌ Possíveis causas:')
      console.error('   1. Imagem da roupa não está isolada (precisa fundo branco/transparente)')
      console.error('   2. Imagem da pessoa não é de corpo inteiro')
      console.error('   3. URLs não são acessíveis pelo Replicate')
      console.error('   4. Tipo de roupa incorreto (tentou top_image mas é dress ou vice-versa)')
      
      // TENTA RETRY com dress_image se usou top_image
      if (!isDress) {
        console.log('🔄 Tentando retry com dress_image...')
        try {
          const retryInput = {
            dress_image: request.garmentImage,
            model_image: request.personImage,
          }
          const retryPrediction = await replicate.predictions.create({
            version: await getVellaVersion(replicate),
            input: retryInput,
          })
          
          // Polling rápido (30 segundos)
          let retryFinal = retryPrediction
          for (let i = 0; i < 15; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            retryFinal = await replicate.predictions.get(retryPrediction.id)
            if (retryFinal.status === 'succeeded' || retryFinal.status === 'failed') break
          }
          
          if (retryFinal.status === 'succeeded' && retryFinal.output) {
            const retryOutput = Array.isArray(retryFinal.output) ? retryFinal.output[0] : retryFinal.output
            const retryUrl = typeof retryOutput === 'string' ? retryOutput : String(retryOutput)
            
            if (retryUrl !== request.personImage && retryUrl.split('?')[0] !== cleanPersonUrl) {
              console.log('✅ Retry com dress_image funcionou!')
              return {
                id: retryPrediction.id,
                status: 'succeeded',
                output: [retryUrl],
              }
            }
          }
        } catch (retryError: any) {
          console.error('❌ Retry também falhou:', retryError.message)
        }
      }
      
      throw new Error(
        'Vella retornou a imagem original da pessoa. ' +
        'Isso indica que o modelo não conseguiu processar. ' +
        'Verifique se: (1) A roupa está isolada em fundo branco, ' +
        '(2) A pessoa está de corpo inteiro, (3) As URLs são públicas.'
      )
    } else {
      console.log('✅ URL retornada é diferente da imagem original - sucesso!')
    }
    
    // Retorna apenas a primeira imagem (não precisa duplicar)
    return {
      id: `gen_${Date.now()}`,
      status: 'succeeded',
      output: [firstUrl], // Retorna apenas 1 imagem (a melhor)
    }
  } catch (error: any) {
    console.error('❌ ERRO ao gerar try-on com Vella:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    
    // Se der erro, tenta criar uma predição assíncrona
    if (error.message?.includes('version') || error.message?.includes('not found')) {
      throw new Error(
        `Modelo "${MODEL_NAME}" não encontrado. ` +
        `Verifique se o nome do modelo está correto em lib/api/replicate-tryon.ts. ` +
        `Erro original: ${error.message}`
      )
    }
    
    // Erros específicos do Vella
    if (error.message?.includes('image') || error.message?.includes('URL')) {
      throw new Error(
        `Erro ao processar imagens no Vella. ` +
        `Verifique se as URLs são públicas e acessíveis. ` +
        `Erro: ${error.message}`
      )
    }
    
    throw new Error(`Erro ao gerar try-on: ${error.message || 'Erro desconhecido'}`)
  }
}

/**
 * Verifica status de uma geração de try-on
 * Nota: Com a biblioteca cliente, geralmente retorna direto
 * Mas mantemos esta função para compatibilidade
 */
export async function checkTryOnStatus(
  predictionId: string
): Promise<TryOnResponse> {
  const apiToken = process.env.REPLICATE_API_TOKEN?.trim()

  if (!apiToken || apiToken.length === 0) {
    throw new Error('REPLICATE_API_TOKEN não configurado')
  }

  const replicate = new Replicate({
    auth: apiToken,
  })

  try {
    // Busca a predição pelo ID
    const prediction = await replicate.predictions.get(predictionId)

    return {
      id: prediction.id,
      status: prediction.status as any,
      output: prediction.output as any,
      error: prediction.error as any,
      urls: {
        get: `https://api.replicate.com/v1/predictions/${predictionId}`,
        cancel: `https://api.replicate.com/v1/predictions/${predictionId}/cancel`,
      },
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao verificar status')
  }
}
