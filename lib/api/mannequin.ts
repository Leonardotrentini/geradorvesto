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

  console.log('🔵 Iniciando geração de manequim...')
  console.log('🔵 Gênero:', request.gender)
  console.log('🔵 Prompt:', prompt.substring(0, 200) + '...')
  
  // Tenta primeiro com SDXL (melhor qualidade)
  try {
    console.log('🔵 Tentando gerar manequim com SDXL...')
    const input = {
      prompt,
      negative_prompt: 'realistic human face, skin texture, detailed facial features, hair, person, blurry, low quality, distorted, deformed, ugly, bad anatomy, multiple people, realistic skin',
      num_inference_steps: 50, // Aumentado para melhor qualidade
      guidance_scale: 8.0, // Aumentado para melhor aderência ao prompt
      width: 768, // Aumentado para melhor qualidade
      height: 1024, // Aumentado para melhor qualidade
    }
    
    console.log('🔵 SDXL Input:', JSON.stringify(input, null, 2))
    
    const output = await replicate.run(SDXL_MODEL, { input })

    console.log('✅ SDXL retornou resultado')
    console.log('🔵 Output raw:', output)
    console.log('🔵 Output type:', typeof output)
    
    // Processa o output
    let imageUrl: string
    if (Array.isArray(output)) {
      if (output.length === 0) {
        throw new Error('SDXL retornou array vazio')
      }
      imageUrl = typeof output[0] === 'string' ? output[0] : (output[0] as any).url || String(output[0])
    } else if (typeof output === 'string') {
      imageUrl = output
    } else {
      imageUrl = (output as any).url || String(output)
    }

    if (!imageUrl || imageUrl.length === 0) {
      throw new Error('SDXL retornou URL vazia ou inválida')
    }

    console.log('✅ Manequim gerado com SDXL com sucesso:', imageUrl.substring(0, 100) + '...')
    return {
      image: imageUrl,
    }
  } catch (error: any) {
    // Se SDXL falhar, tenta com modelo básico
    console.error('❌ SDXL falhou:', error.message)
    console.error('❌ Error stack:', error.stack)
    console.warn('⚠️ Tentando fallback com modelo básico...')
    
    try {
      console.log('🔵 Tentando gerar manequim com modelo básico (Stable Diffusion)...')
      const fallbackInput = {
        prompt,
        negative_prompt: 'realistic human face, skin texture, detailed facial features, hair, person, blurry, low quality, realistic skin',
        num_inference_steps: 50,
        guidance_scale: 8.5,
        width: 512,
        height: 768,
      }
      
      console.log('🔵 Fallback Input:', JSON.stringify(fallbackInput, null, 2))
      
      const output = await replicate.run(BASIC_MODEL, { input: fallbackInput })

      console.log('✅ Modelo básico retornou resultado')
      console.log('🔵 Output raw:', output)
      
      let imageUrl: string
      if (Array.isArray(output)) {
        if (output.length === 0) {
          throw new Error('Modelo básico retornou array vazio')
        }
        imageUrl = typeof output[0] === 'string' ? output[0] : (output[0] as any).url || String(output[0])
      } else if (typeof output === 'string') {
        imageUrl = output
      } else {
        imageUrl = (output as any).url || String(output)
      }

      if (!imageUrl || imageUrl.length === 0) {
        throw new Error('Modelo básico retornou URL vazia ou inválida')
      }

      console.log('✅ Manequim gerado com modelo básico com sucesso:', imageUrl.substring(0, 100) + '...')
      return { image: imageUrl }
    } catch (fallbackError: any) {
      console.error('❌ ERRO CRÍTICO: Ambos os modelos falharam!')
      console.error('❌ SDXL Error:', error.message)
      console.error('❌ Fallback Error:', fallbackError.message)
      console.error('❌ Fallback Stack:', fallbackError.stack)
      throw new Error(
        `Erro ao gerar manequim: SDXL falhou (${error.message}), ` +
        `Fallback também falhou (${fallbackError.message}). ` +
        `Verifique os logs para mais detalhes.`
      )
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

