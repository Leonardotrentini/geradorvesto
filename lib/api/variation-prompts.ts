/**
 * Prompts específicos para cada variação de estilo
 */

export type VariationStyle = 'provador' | 'fotografo' | 'loja' | 'editorial'

export interface VariationConfig {
  style: VariationStyle
  description: string
}

export const VARIATION_STYLES: Record<number, VariationConfig> = {
  1: {
    style: 'provador',
    description: 'Estilo provador - ambiente neutro, como em um provador de loja',
  },
  2: {
    style: 'fotografo',
    description: 'Foto natural de fotógrafo - luz natural, ambiente casual e autêntico',
  },
  3: {
    style: 'loja',
    description: 'Dentro de uma loja - ambiente comercial com prateleiras e iluminação de loja',
  },
  4: {
    style: 'editorial',
    description: 'Estilo editorial - fundo artístico, iluminação profissional, alta qualidade',
  },
}

/**
 * Gera prompt específico para cada variação baseado no estilo
 */
export function generateVariationPrompt(
  style: VariationStyle,
  baseConfig: {
    gender: string
    age: number
    bodyShape: string
  }
): string {
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

  const gender = genderMap[baseConfig.gender] || 'model'
  const shape = shapeMap[baseConfig.bodyShape] || 'average build'

  const stylePrompts: Record<VariationStyle, string> = {
    provador: `Professional fashion photography, ${gender} model, ${shape} body type, age ${baseConfig.age}, wearing fashion clothing, fitting room environment, neutral background, mirror reflection, soft lighting, clean white or beige walls, minimalist setting, high quality, detailed, 8k, photorealistic, natural pose, like trying on clothes in a store`,
    
    fotografo: `Natural fashion photography, ${gender} model, ${shape} body type, age ${baseConfig.age}, wearing fashion clothing, natural lighting, authentic environment, casual setting, photographer style, candid moment, soft natural light, real-world background, high quality, detailed, 8k, photorealistic, natural expression, lifestyle photography, genuine atmosphere`,
    
    loja: `Commercial fashion photography, ${gender} model, ${shape} body type, age ${baseConfig.age}, wearing fashion clothing, retail store interior, shopping environment, store shelves in background, commercial lighting, retail setting, fashion boutique atmosphere, product display, high quality, detailed, 8k, photorealistic, professional retail photography, store environment`,
    
    editorial: `Editorial fashion photography, ${gender} model, ${shape} body type, age ${baseConfig.age}, wearing fashion clothing, artistic background, professional studio lighting, high fashion style, editorial magazine quality, dramatic lighting, sophisticated composition, luxury fashion aesthetic, high quality, detailed, 8k, photorealistic, fashion editorial, artistic setting, premium photography`,
  }

  return stylePrompts[style] || stylePrompts.provador
}

