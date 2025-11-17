/**
 * Gerador de prompts otimizados para Virtual Try-On
 * Baseado no briefing técnico completo
 */

export interface PromptConfig {
  typeOfGarment: 'dress' | 'top' | 'bottom' | 'jumpsuit' | 'jacket' | 'other'
  color?: string
  description?: string
  gender?: 'homem' | 'mulher' | 'nao-binario'
}

/**
 * Gera prompt otimizado para avatar vestindo a peça
 * Baseado no template do briefing técnico
 */
export function generateAvatarPrompt(config: PromptConfig): string {
  const garmentType = getGarmentTypeText(config.typeOfGarment)
  const colorDesc = config.color || config.description || 'the uploaded garment'
  
  return `Full-body photo of the same woman, standing in a natural pose, wearing the uploaded ${garmentType} in ${colorDesc}. Keep her face, hair, body and proportions exactly the same as the original photo. The clothing must follow the shape of her body realistically, with natural folds, correct gravity and soft shadows. Studio lighting, clean white background, high-resolution fashion e-commerce photo, extremely realistic, 4k, sharp details, no distortions, no extra limbs.`
}

/**
 * Gera negative prompt robusto
 */
export function generateNegativePrompt(): string {
  return `no extra arms, no extra legs, no deformed hands, no distorted face, no glitch, no blurry details, no double clothing, no duplicate body parts, no text, no logos, no watermark, no unrealistic proportions, no cartoon style, no exaggerated makeup, no strange artifacts on clothes or skin, no floating objects, no distorted body parts, no extra fingers, no missing limbs`
}

/**
 * Gera prompt para manequim em loja premium
 */
export function generateMannequinPrompt(config: PromptConfig): string {
  const garmentType = getGarmentTypeText(config.typeOfGarment)
  const colorDesc = config.color || config.description || 'elegant fashion garment'
  const genderText = config.gender === 'homem' ? 'male' : 'female'
  
  // Prompt para manequim simples, branco, minimalista, fundo preto (como referência)
  // Estilo e-commerce profissional - foco total no produto
  return `professional product photography, white minimalist ${genderText} mannequin, smooth matte white surface, no facial features, no eyes, no nose, no mouth, no hair, clean modern design, wearing ${colorDesc} ${garmentType}, standing pose, arms at sides, solid black background, studio lighting, high quality, 4k, sharp details, mannequin only, product display, e-commerce style`
}

/**
 * Gera negative prompt para manequim
 */
export function generateMannequinNegativePrompt(): string {
  return `no people, no faces, no realistic human face, no skin texture, no detailed facial features, no hair, no person, no blur, no cartoon style, no low-resolution, no watermark, no text, no logos, no extra limbs, no deformed mannequin, no multiple mannequins, no realistic eyes, no realistic hands, no human body parts, no living person, mannequin only, display mannequin, no store interior, no background objects, no furniture, no decorations, no accessories, no glass cases, no retail environment, solid black background only, minimalist, clean, simple`
}

/**
 * Converte tipo de roupa para texto descritivo
 */
function getGarmentTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    'dress': 'maxi dress',
    'top': 'top or blouse',
    'bottom': 'pants or shorts',
    'jumpsuit': 'jumpsuit',
    'jacket': 'jacket or blazer',
    'other': 'fashion garment',
  }
  
  return typeMap[type] || 'fashion garment'
}

/**
 * Detecta cor e descrição da roupa (heurística básica)
 * FUTURO: Usar análise de imagem para detectar cor real
 */
export function detectGarmentColorAndType(imageUrl: string): { color?: string; type?: string } {
  const lowerUrl = imageUrl.toLowerCase()
  
  // Detecção básica de cor pelo nome do arquivo
  const colors = ['red', 'vermelho', 'blue', 'azul', 'green', 'verde', 'black', 'preto', 'white', 'branco', 'yellow', 'amarelo', 'pink', 'rosa', 'orange', 'laranja']
  const detectedColor = colors.find(color => lowerUrl.includes(color))
  
  // Detecção básica de tipo
  let detectedType: string | undefined
  if (lowerUrl.includes('dress') || lowerUrl.includes('vestido')) {
    detectedType = 'dress'
  } else if (lowerUrl.includes('top') || lowerUrl.includes('blusa') || lowerUrl.includes('camisa')) {
    detectedType = 'top'
  } else if (lowerUrl.includes('pants') || lowerUrl.includes('calça') || lowerUrl.includes('short')) {
    detectedType = 'bottom'
  } else if (lowerUrl.includes('jumpsuit') || lowerUrl.includes('macacão')) {
    detectedType = 'jumpsuit'
  } else if (lowerUrl.includes('jacket') || lowerUrl.includes('blazer') || lowerUrl.includes('casaco')) {
    detectedType = 'jacket'
  }
  
  return {
    color: detectedColor,
    type: detectedType,
  }
}

