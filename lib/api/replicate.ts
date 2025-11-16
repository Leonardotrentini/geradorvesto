/**
 * Integração com Replicate API para geração de imagens
 * 
 * Para usar, você precisa:
 * 1. Criar conta em https://replicate.com
 * 2. Obter API token
 * 3. Adicionar REPLICATE_API_TOKEN no .env.local
 */

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions'

export interface ReplicateGenerationRequest {
  productImageUrl: string
  prompt: string
  negativePrompt?: string
  numOutputs?: number
}

export interface ReplicateGenerationResponse {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string[]
  error?: string
  urls?: {
    get: string
    cancel: string
  }
}

/**
 * Gera imagens usando Stable Diffusion via Replicate
 * Gera múltiplas imagens em paralelo
 */
export async function generateWithReplicate(
  request: ReplicateGenerationRequest
): Promise<ReplicateGenerationResponse> {
  const apiToken = process.env.REPLICATE_API_TOKEN?.trim()

  if (!apiToken || apiToken.length === 0) {
    throw new Error('REPLICATE_API_TOKEN não configurado')
  }

  // Modelo para geração de imagens de moda
  // Usando Stable Diffusion (versão básica, mais estável e testada)
  // Este modelo funciona bem para fashion photography
  // Formato: owner/model:version-id
  const modelVersion = 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf'
  
  // Se quiser usar SDXL (melhor qualidade, mas pode ter problemas de versão):
  // Acesse https://replicate.com/stability-ai/sdxl e copie o ID da versão mais recente

  const numOutputs = request.numOutputs || 4

  // Para contas sem pagamento, o Replicate limita a 1 requisição por vez (burst)
  // Vamos gerar sequencialmente para respeitar o rate limit
  // Se tiver método de pagamento, pode gerar em paralelo
  
  // Por enquanto, vamos gerar apenas 1 imagem para evitar rate limit
  // Depois que adicionar método de pagamento, pode aumentar para 4
  const actualOutputs = 1 // Mude para numOutputs quando tiver pagamento configurado

  const response = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: modelVersion,
      input: {
        prompt: request.prompt,
        negative_prompt: request.negativePrompt || 'blurry, low quality, distorted, deformed, ugly, bad anatomy',
        num_inference_steps: 50,
        guidance_scale: 7.5,
        width: 512,
        height: 512,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    
    // Se for rate limit, dá uma mensagem mais clara
    if (response.status === 429 || error.detail?.includes('rate limit')) {
      throw new Error('Limite de requisições atingido. Aguarde alguns segundos ou adicione um método de pagamento no Replicate para aumentar o limite.')
    }
    
    throw new Error(error.detail || 'Erro ao gerar imagens')
  }

  return response.json()
}

/**
 * Verifica status de uma geração
 */
export async function checkGenerationStatus(
  predictionId: string
): Promise<ReplicateGenerationResponse> {
  const apiToken = process.env.REPLICATE_API_TOKEN?.trim()

  if (!apiToken || apiToken.length === 0) {
    throw new Error('REPLICATE_API_TOKEN não configurado')
  }

  const response = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
    headers: {
      'Authorization': `Token ${apiToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Erro ao verificar status')
  }

  return response.json()
}

/**
 * Gera prompt otimizado para moda baseado na configuração
 */
export function generateFashionPrompt(config: {
  gender: string
  age: number
  bodyShape: string
  scenario: string
  scenarioType?: string
}): string {
  const genderMap: Record<string, string> = {
    'homem': 'male model',
    'mulher': 'female model',
    'nao-binario': 'androgynous model',
  }

  const shapeMap: Record<string, string> = {
    'magro': 'slim',
    'atletico': 'athletic',
    'medio': 'average build',
    'robusto': 'stocky',
    'plus-size': 'plus-size',
  }

  const scenarioMap: Record<string, string> = {
    'avatar': 'studio background, professional photography, clean white background',
    'rua': 'urban street, city environment, natural lighting, street style',
    'cenario': getScenarioTypePrompt(config.scenarioType || 'estudio'),
  }

  const gender = genderMap[config.gender] || 'model'
  const shape = shapeMap[config.bodyShape] || 'average build'
  const scenario = scenarioMap[config.scenario] || 'studio background'

  return `Professional fashion photography, ${gender} model, ${shape} body type, age ${config.age}, wearing fashion clothing, ${scenario}, high quality, detailed, 8k, photorealistic, professional lighting, fashion photography style`
}

function getScenarioTypePrompt(type: string): string {
  const prompts: Record<string, string> = {
    'estudio': 'studio background, professional photography, clean white background',
    'praia': 'beach setting, ocean background, natural sunlight, beachwear fashion',
    'parque': 'park setting, green background, natural lighting, outdoor fashion',
    'loja': 'retail store interior, shopping environment, commercial photography',
    'evento': 'event setting, elegant background, evening wear, formal fashion',
    'urbano': 'urban street, city environment, street style, urban fashion',
  }
  return prompts[type] || 'studio background'
}


