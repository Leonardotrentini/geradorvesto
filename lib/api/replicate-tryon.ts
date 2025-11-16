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
  
  const input: any = {
    // Vella aceita top_image (camisa/blusa) ou dress_image (vestido)
    // Vamos usar top_image por padrão (funciona para qualquer peça)
    top_image: request.garmentImage,
    
    // model_image é OBRIGATÓRIO para Vella
    model_image: request.personImage,
    
    // Parâmetros opcionais que melhoram resultados
    // category: 'top' // Pode ser 'top', 'dress', 'bottom', etc.
  }

  try {
    console.log('🔵 Enviando requisição para Vella 1.5...')
    console.log('🔵 Input completo:', JSON.stringify(input, null, 2))
    
    // Usa a biblioteca cliente que aceita o nome do modelo diretamente
    const output = await replicate.run(MODEL_NAME, { input })

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

    // Valida se a primeira URL é diferente da imagem original da pessoa
    const firstUrl = outputUrls[0]
    if (firstUrl === request.personImage) {
      console.warn('⚠️ ATENÇÃO: URL retornada é igual à imagem original da pessoa!')
      console.warn('⚠️ Isso pode indicar que o Vella não processou a imagem corretamente.')
      console.warn('⚠️ Verifique se:')
      console.warn('   - A imagem da roupa está isolada (fundo branco/transparente)')
      console.warn('   - A imagem da pessoa é de corpo inteiro')
      console.warn('   - As URLs são públicas e acessíveis')
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
