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
  // CRÍTICO: Baseado na análise da imagem de referência
  // - Branco PURO (não bege/creme)
  // - Superfície matte lisa (sem textura)
  // - Sem rosto, sem detalhes faciais
  // - Fundo preto PURO sólido (não cinza)
  // - Sem ambiente, sem decorações
  // - Apenas um manequim
  return `white mannequin, pure white, matte white surface, smooth white, no face, no eyes, no nose, no mouth, no hair, no facial features, no details, no realistic features, minimalist white mannequin, clean white body, simple white mannequin, wearing ${colorDesc} ${garmentType}, standing straight, arms at sides, simple pose, solid pure black background, pure black, no texture, no patterns, no objects, no furniture, no store, no environment, no decorations, no accessories, product photography, studio lighting, high contrast, white on black, isolated, minimalist, clean, simple, single mannequin only`
}

/**
 * Gera negative prompt para manequim
 */
export function generateMannequinNegativePrompt(): string {
  return `no beige, no cream, no colored mannequin, no gray wall, no concrete, no texture, no patterns, no store interior, no background objects, no furniture, no decorations, no accessories, no glass cases, no retail environment, no boutique, no shop, no store, no environment, no walls, no floor, no lighting fixtures, no displays, no shelves, no racks, no hangers, no wooden hanger, no multiple mannequins, no realistic hands, no detailed hands, no body contours, no realistic features, no warm tones, no beige tones, no gray background, no textured background, no people, no faces, no realistic human face, no skin texture, no detailed facial features, no hair, no person, no blur, no cartoon style, no low-resolution, no watermark, no text, no logos, no extra limbs, no deformed mannequin, no golden mannequins, no stylized mannequins, no dynamic poses, no raised arms, no complex poses, no marble, no luxury details, no opulent atmosphere, no warm lighting, no sophisticated lighting, only pure white mannequin, only solid pure black background, minimalist, clean, simple, isolated`
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

