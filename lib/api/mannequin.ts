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
// Usa modelo básico primeiro (mais confiável), SDXL como fallback
// IMPORTANTE: Modelo básico é mais estável e rápido
const BASIC_MODEL = 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf'
const SDXL_MODEL = 'stability-ai/sdxl' // Fallback se básico falhar

/**
 * Obtém versão do SDXL
 */
async function getSDXLVersion(replicate: any): Promise<string> {
  try {
    const model = await replicate.models.get('stability-ai', 'sdxl')
    const latestVersion = model.latest_version
    if (!latestVersion) {
      throw new Error('Não foi possível obter versão do SDXL')
    }
    console.log('🔵 Versão do SDXL:', latestVersion.id)
    return latestVersion.id
  } catch (error: any) {
    console.warn('⚠️ Não foi possível obter versão do SDXL:', error.message)
    // Tenta usar o nome do modelo diretamente
    throw new Error('Não foi possível obter versão do modelo SDXL')
  }
}

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
  
  // Prompt otimizado baseado no briefing técnico
  const promptModule = await import('@/lib/utils/promptGenerator')
  const { generateMannequinPrompt, generateMannequinNegativePrompt, detectGarmentColorAndType } = promptModule
  
  // Detecta cor e tipo da roupa
  const garmentInfo = detectGarmentColorAndType(request.garmentImage)
  const garmentType = garmentInfo.type || 'dress'
  const garmentColor = garmentInfo.color || 'elegant'
  
  // Gera prompt otimizado
  const prompt = generateMannequinPrompt({
    typeOfGarment: garmentType as any,
    color: garmentColor,
    gender: request.gender,
  })

  console.log('🔵 Iniciando geração de manequim...')
  console.log('🔵 Gênero:', request.gender)
  console.log('🔵 Tipo detectado:', garmentType)
  console.log('🔵 Cor detectada:', garmentColor)
  console.log('🔵 Prompt:', prompt.substring(0, 200) + '...')
  
  // Gera negative prompt uma vez
  const negativePrompt = generateMannequinNegativePrompt()
  
  // Tenta primeiro com modelo básico (mais confiável e rápido)
  try {
    console.log('🔵 Tentando gerar manequim com Stable Diffusion (básico)...')
    const input = {
      prompt,
      negative_prompt: negativePrompt,
      num_inference_steps: 50, // Aumentado para melhor qualidade
      guidance_scale: 9.0, // Aumentado para melhor aderência ao prompt
      width: 512, // Dimensões padrão (mais confiável)
      height: 768, // Proporção vertical para manequim
      scheduler: 'DPMSolverMultistep', // Scheduler mais confiável
    }
    
    console.log('🔵 Basic Model Input:', JSON.stringify(input, null, 2))
    
    // Usa processamento assíncrono para garantir que complete
    const prediction = await replicate.predictions.create({
      version: BASIC_MODEL.split(':')[1], // Extrai versão do modelo
      input,
    })
    
    console.log('🔵 Prediction ID:', prediction.id)
    
    // Polling até completar (máximo 1 minuto)
    let finalPrediction = prediction
    const maxAttempts = 30
    let attempts = 0
    
    while (finalPrediction.status !== 'succeeded' && finalPrediction.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      finalPrediction = await replicate.predictions.get(prediction.id)
      attempts++
      console.log(`🔵 Tentativa ${attempts}/${maxAttempts} - Status: ${finalPrediction.status}`)
    }
    
    if (finalPrediction.status === 'failed') {
      throw new Error(`Modelo básico falhou: ${finalPrediction.error || 'Erro desconhecido'}`)
    }
    
    if (finalPrediction.status !== 'succeeded') {
      throw new Error(`Modelo básico não completou a tempo. Status: ${finalPrediction.status}`)
    }
    
    const output = finalPrediction.output

    console.log('✅ Modelo básico retornou resultado')
    console.log('🔵 Output raw:', output)
    console.log('🔵 Output type:', typeof output)
    
    // Processa o output
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
    return {
      image: imageUrl,
    }
  } catch (error: any) {
    // Se modelo básico falhar, tenta com SDXL como fallback
    console.error('❌ Modelo básico falhou:', error.message)
    console.error('❌ Error stack:', error.stack)
    console.warn('⚠️ Tentando fallback com SDXL...')
    
    try {
      console.log('🔵 Tentando gerar manequim com SDXL (fallback)...')
      const fallbackInput = {
        prompt,
        negative_prompt: negativePrompt,
        num_inference_steps: 30, // Reduzido para ser mais rápido
        guidance_scale: 7.5,
        width: 512, // Reduzido para evitar erros
        height: 768,
      }
      
      console.log('🔵 SDXL Fallback Input:', JSON.stringify(fallbackInput, null, 2))
      
      // Tenta usar SDXL diretamente
      const output = await replicate.run(SDXL_MODEL, { input: fallbackInput })

      console.log('✅ SDXL retornou resultado')
      console.log('🔵 Output raw:', output)
      
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

      console.log('✅ Manequim gerado com SDXL (fallback) com sucesso:', imageUrl.substring(0, 100) + '...')
      return { image: imageUrl }
    } catch (fallbackError: any) {
      console.error('❌ ERRO CRÍTICO: Ambos os modelos falharam!')
      console.error('❌ Modelo básico Error:', error.message)
      console.error('❌ SDXL Fallback Error:', fallbackError.message)
      console.error('❌ Fallback Stack:', fallbackError.stack)
      throw new Error(
        `Erro ao gerar manequim: Modelo básico falhou (${error.message}), ` +
        `SDXL fallback também falhou (${fallbackError.message}). ` +
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

