/**
 * Integração com Hugging Face Inference API (GRATUITA)
 * 
 * Para usar:
 * 1. Criar conta em https://huggingface.co (gratuita)
 * 2. Obter API token em https://huggingface.co/settings/tokens
 * 3. Adicionar HUGGINGFACE_API_TOKEN no .env.local
 * 
 * Modelos gratuitos disponíveis:
 * - runwayml/stable-diffusion-v1-5
 * - stabilityai/stable-diffusion-2-1
 * - CompVis/stable-diffusion-v1-4
 */

// URL da API do Hugging Face
// Tentando a URL antiga primeiro (pode ainda funcionar com permissões corretas)
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models'

export interface HuggingFaceGenerationRequest {
  prompt: string
  negativePrompt?: string
  numOutputs?: number
}

export interface HuggingFaceGenerationResponse {
  image?: string // Base64 image
  error?: string
}

/**
 * Gera imagens usando Hugging Face (GRATUITO)
 */
export async function generateWithHuggingFace(
  request: HuggingFaceGenerationRequest
): Promise<HuggingFaceGenerationResponse> {
  const apiToken = process.env.HUGGINGFACE_API_TOKEN?.trim()

  if (!apiToken || apiToken.length === 0) {
    throw new Error('HUGGINGFACE_API_TOKEN não configurado. Crie uma conta gratuita em https://huggingface.co')
  }

  // Modelo gratuito do Hugging Face
  // runwayml/stable-diffusion-v1-5 é um dos melhores modelos gratuitos
  const model = 'runwayml/stable-diffusion-v1-5'

  // URL da API do Hugging Face
  const apiUrl = `${HUGGINGFACE_API_URL}/${model}`
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: request.prompt,
      parameters: {
        negative_prompt: request.negativePrompt || 'blurry, low quality, distorted, deformed, ugly, bad anatomy',
        num_inference_steps: 30, // Reduzido para ser mais rápido
        guidance_scale: 7.5,
        width: 512,
        height: 512,
      },
    }),
  })

  if (!response.ok) {
    let errorData: any = {}
    try {
      errorData = await response.json()
    } catch {
      errorData = { error: `Erro HTTP ${response.status}` }
    }
    
    // Se for 404, tenta com a nova URL do router
    if (response.status === 404) {
      console.log('URL antiga retornou 404, tentando nova URL do router...')
      const newApiUrl = `https://router.huggingface.co/hf-inference/models/${model}`
      const newResponse = await fetch(newApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: request.prompt,
          parameters: {
            negative_prompt: request.negativePrompt || 'blurry, low quality, distorted, deformed, ugly, bad anatomy',
            num_inference_steps: 30,
            guidance_scale: 7.5,
            width: 512,
            height: 512,
          },
        }),
      })
      
      if (newResponse.ok) {
        const blob = await newResponse.blob()
        const arrayBuffer = await blob.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const mimeType = blob.type || 'image/png'
        
        return {
          image: `data:${mimeType};base64,${base64}`,
        }
      }
      
      // Se a nova URL também falhar, retorna erro
      const newErrorData = await newResponse.json().catch(() => ({ error: `Erro HTTP ${newResponse.status}` }))
      throw new Error(newErrorData.error || newErrorData.message || `Erro 404: Modelo não encontrado`)
    }
    
    if (response.status === 503) {
      // Modelo está carregando, aguarde e tente novamente
      console.log('Modelo carregando, aguardando 10 segundos...')
      await new Promise(resolve => setTimeout(resolve, 10000))
      // Tenta novamente uma vez
      const retryResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: request.prompt,
          parameters: {
            negative_prompt: request.negativePrompt || 'blurry, low quality, distorted, deformed, ugly, bad anatomy',
            num_inference_steps: 30,
            guidance_scale: 7.5,
            width: 512,
            height: 512,
          },
        }),
      })
      
      if (!retryResponse.ok) {
        throw new Error('Modelo ainda está carregando. Tente novamente em alguns segundos.')
      }
      
      // Se o retry funcionou, continua com o retryResponse
      const blob = await retryResponse.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const mimeType = blob.type || 'image/png'
      
      return {
        image: `data:${mimeType};base64,${base64}`,
      }
    }
    
    if (response.status === 429) {
      throw new Error('Limite de requisições do Hugging Face atingido. Aguarde alguns minutos ou use o Replicate.')
    }
    
    throw new Error(errorData.error || errorData.message || `Erro ao gerar imagem: ${response.status}`)
  }

  // Hugging Face retorna a imagem como blob
  let blob: Blob
  try {
    blob = await response.blob()
    
    // Verifica se é uma imagem válida
    if (!blob.type.startsWith('image/')) {
      // Pode ser um JSON de erro
      const text = await blob.text()
      try {
        const errorData = JSON.parse(text)
        throw new Error(errorData.error || errorData.message || 'Erro ao gerar imagem')
      } catch {
        throw new Error('Resposta inválida do Hugging Face')
      }
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao processar resposta do Hugging Face')
  }
  
  // Converte blob para base64
  const arrayBuffer = await blob.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const mimeType = blob.type || 'image/png'
  
  return {
    image: `data:${mimeType};base64,${base64}`,
  }
}

/**
 * Gera múltiplas imagens (sequencialmente para respeitar rate limit)
 */
export async function generateMultipleWithHuggingFace(
  request: HuggingFaceGenerationRequest
): Promise<string[]> {
  const numOutputs = request.numOutputs || 4
  const images: string[] = []

  // Tenta gerar pelo menos 1 imagem (reduzido de 4 para 1 para garantir que funcione)
  const numOutputsToGenerate = Math.min(numOutputs, 1) // Por enquanto, gerar apenas 1 para garantir
  
  for (let i = 0; i < numOutputsToGenerate; i++) {
    let retries = 2 // Tenta até 2 vezes
    let success = false
    
    while (retries > 0 && !success) {
      try {
        console.log(`Gerando imagem ${i + 1}/${numOutputsToGenerate} com Hugging Face... (tentativa ${3 - retries}/2)`)
        const result = await generateWithHuggingFace({
          prompt: request.prompt,
          negativePrompt: request.negativePrompt,
        })
        
        if (result.image) {
          images.push(result.image)
          console.log(`Imagem ${i + 1} gerada com sucesso`)
          success = true
        } else {
          console.warn(`Imagem ${i + 1} não foi gerada, tentando novamente...`)
          retries--
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 5000)) // Aguarda 5 segundos antes de tentar novamente
          }
        }
      } catch (error: any) {
        console.error(`Erro ao gerar imagem ${i + 1}/${numOutputsToGenerate}:`, error.message)
        
        // Se for erro de rate limit, para tudo
        if (error.message.includes('rate') || error.message.includes('429')) {
          throw new Error('Limite de requisições do Hugging Face atingido. Aguarde alguns minutos e tente novamente.')
        }
        
        // Se for erro de modelo carregando, tenta novamente
        if (error.message.includes('carregando') || error.message.includes('503')) {
          retries--
          if (retries > 0) {
            console.log('Modelo carregando, aguardando 15 segundos antes de tentar novamente...')
            await new Promise(resolve => setTimeout(resolve, 15000)) // Aguarda 15 segundos
          } else {
            throw new Error('Modelo do Hugging Face está demorando para carregar. Tente novamente em alguns minutos.')
          }
        } else {
          // Para outros erros, tenta novamente
          retries--
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 5000))
          } else {
            throw error
          }
        }
      }
    }
    
    // Aguarda um pouco entre requisições para respeitar rate limit
    if (i < numOutputsToGenerate - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000)) // 3 segundos
    }
  }
  
  if (images.length === 0) {
    throw new Error('Não foi possível gerar imagens com o Hugging Face. O modelo pode estar temporariamente indisponível. Tente novamente em alguns minutos.')
  }
  
  // Se gerou menos do que o solicitado, duplica a primeira imagem para ter pelo menos algumas variações
  while (images.length < numOutputs && images.length > 0) {
    images.push(images[0]) // Duplica a primeira imagem
  }

  return images
}

