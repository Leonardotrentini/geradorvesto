/**
 * Geração de manequim de loja com a peça de roupa
 * 
 * Estratégia: Usar text-to-image com prompt detalhado que descreve a roupa
 * O modelo vai tentar gerar um manequim vestindo algo similar
 * 
 * FUTURO: Implementar inpainting para colocar a roupa exata
 */

import Replicate from 'replicate'

export interface MannequinRequest {
  garmentImage: string // URL da foto da roupa (usado para referência visual no prompt)
  gender: 'homem' | 'mulher' // Gênero do manequim
}

export interface MannequinResponse {
  image: string // URL da imagem gerada
}

// Modelo para gerar manequim
// Tenta SDXL primeiro, se falhar usa modelo básico
// IMPORTANTE: Se der erro, você precisa pegar a versão mais recente em:
// https://replicate.com/stability-ai/sdxl
const SDXL_MODEL = 'stability-ai/sdxl' // Usa versão mais recente automaticamente
const BASIC_MODEL = 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf'

/**
 * Gera imagem de manequim de loja vestindo a peça
 * 
 * NOTA: Por enquanto, gera um manequim com roupa similar
 * Para colocar a roupa EXATA, precisaríamos de inpainting (implementação futura)
 */
export async function generateMannequin(
  request: MannequinRequest
): Promise<MannequinResponse> {
  const apiToken = process.env.REPLICATE_API_TOKEN?.trim()

  if (!apiToken || apiToken.length === 0) {
    throw new Error('REPLICATE_API_TOKEN não configurado')
  }

  const replicate = new Replicate({
    auth: apiToken,
  })

  // Prompt detalhado para gerar manequim humanizado de loja
  const genderText = request.gender === 'homem' ? 'male' : 'female'
  
  // Background e estilo adaptados ao gênero
  let backgroundStyle: string
  let mannequinStyle: string
  
  if (request.gender === 'homem') {
    // Estilo masculino: moderno, industrial, urbano
    backgroundStyle = 'modern clothing store, industrial chic interior, exposed brick walls, dark wood floors, warm track lighting, clothing racks in background, bustling retail environment, contemporary boutique atmosphere'
    mannequinStyle = 'realistic male mannequin, human-like proportions, natural pose, standing confidently, modern retail display'
  } else {
    // Estilo feminino: luxuoso, elegante, sofisticado
    backgroundStyle = 'luxury fashion boutique, elegant display case, rich red and gold accents, polished reflective surfaces, glass display cabinets with accessories, sophisticated retail environment, high-end store atmosphere'
    mannequinStyle = 'realistic female mannequin, human-like proportions, elegant pose, graceful stance, luxury retail display'
  }
  
  // Prompt mais específico e direto
  const prompt = `${genderText} mannequin, ${mannequinStyle}, wearing fashion clothing, ${backgroundStyle}, professional retail photography, high quality, detailed, photorealistic, fashion store display`

  // Tenta primeiro com SDXL (melhor qualidade)
  try {
    console.log('Tentando gerar manequim com SDXL...')
    const output = await replicate.run(SDXL_MODEL, {
      input: {
        prompt,
        negative_prompt: 'realistic human face, skin texture, detailed facial features, hair, person, blurry, low quality, distorted, deformed, ugly, bad anatomy, multiple people',
        num_inference_steps: 40, // Reduzido para ser mais rápido
        guidance_scale: 7.5,
        width: 512, // Reduzido para evitar erros
        height: 768,
      },
    })

    // Processa o output
    let imageUrl: string
    if (Array.isArray(output)) {
      imageUrl = typeof output[0] === 'string' ? output[0] : (output[0] as any).url || String(output[0])
    } else if (typeof output === 'string') {
      imageUrl = output
    } else {
      imageUrl = (output as any).url || String(output)
    }

    console.log('Manequim gerado com SDXL com sucesso:', imageUrl)
    return {
      image: imageUrl,
    }
  } catch (error: any) {
    // Se SDXL falhar, tenta com modelo básico
    console.warn('SDXL falhou, tentando com modelo básico...', error.message)
    
    try {
      console.log('Tentando gerar manequim com modelo básico...')
      const output = await replicate.run(BASIC_MODEL, {
        input: {
          prompt,
          negative_prompt: 'realistic human face, skin texture, detailed facial features, hair, person, blurry, low quality',
          num_inference_steps: 40,
          guidance_scale: 8.0,
          width: 512,
          height: 768,
        },
      })

      let imageUrl: string
      if (Array.isArray(output)) {
        imageUrl = typeof output[0] === 'string' ? output[0] : (output[0] as any).url || String(output[0])
      } else if (typeof output === 'string') {
        imageUrl = output
      } else {
        imageUrl = (output as any).url || String(output)
      }

      console.log('Manequim gerado com modelo básico com sucesso:', imageUrl)
      return { image: imageUrl }
    } catch (fallbackError: any) {
      console.error('Erro ao gerar manequim com ambos os modelos:', fallbackError)
      throw new Error(`Erro ao gerar manequim: ${fallbackError.message}`)
    }
  }
}

/**
 * Alternativa: Usar modelo de inpainting para colocar a roupa no manequim
 * Isso requer um modelo que aceite imagem de roupa + máscara
 */
export async function generateMannequinWithGarment(
  request: MannequinRequest & { garmentMask?: string }
): Promise<MannequinResponse> {
  // Implementação futura: usar inpainting para colocar a roupa exata
  // Por enquanto, usa a função básica
  return generateMannequin(request)
}

