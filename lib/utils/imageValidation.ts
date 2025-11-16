/**
 * Validação avançada de imagens
 */

export interface ImageValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

/**
 * Valida dimensões mínimas da imagem
 */
export function validateImageDimensions(
  file: File,
  minWidth: number = 512,
  minHeight: number = 512
): Promise<{ valid: boolean; width: number; height: number; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const valid = img.width >= minWidth && img.height >= minHeight
      resolve({
        valid,
        width: img.width,
        height: img.height,
        error: valid ? undefined : `Imagem muito pequena. Mínimo: ${minWidth}x${minHeight}px. Atual: ${img.width}x${img.height}px`,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        valid: false,
        width: 0,
        height: 0,
        error: 'Erro ao carregar imagem',
      })
    }

    img.src = url
  })
}

/**
 * Calcula brilho médio da imagem
 */
export function calculateImageBrightness(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível criar contexto do canvas'))
      return
    }

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      let brightness = 0

      // Calcula brilho médio (média dos valores RGB)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        brightness += (r + g + b) / 3
      }

      brightness = brightness / (data.length / 4)
      URL.revokeObjectURL(url)
      resolve(brightness)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Erro ao carregar imagem'))
    }

    img.src = url
  })
}

/**
 * Validação completa da imagem
 */
export async function validateImage(
  file: File,
  options: {
    minWidth?: number
    minHeight?: number
    maxSizeMB?: number
    minBrightness?: number
    maxBrightness?: number
  } = {}
): Promise<ImageValidationResult> {
  const {
    minWidth = 512,
    minHeight = 512,
    maxSizeMB = 10,
    minBrightness = 30,
    maxBrightness = 240,
  } = options

  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // Valida tamanho do arquivo
  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`Arquivo muito grande. Máximo: ${maxSizeMB}MB. Atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
  }

  // Valida formato
  const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validFormats.includes(file.type)) {
    errors.push(`Formato inválido. Use: JPG, PNG ou WebP`)
  }

  // Valida dimensões
  try {
    const dimensions = await validateImageDimensions(file, minWidth, minHeight)
    if (!dimensions.valid && dimensions.error) {
      errors.push(dimensions.error)
    } else if (dimensions.width < minWidth * 1.5 || dimensions.height < minHeight * 1.5) {
      warnings.push(`Imagem com resolução baixa. Recomendado: pelo menos ${minWidth * 2}x${minHeight * 2}px`)
    }
  } catch (error) {
    errors.push('Não foi possível validar dimensões da imagem')
  }

  // Valida brilho (apenas se não houver erros críticos)
  if (errors.length === 0) {
    try {
      const brightness = await calculateImageBrightness(file)
      if (brightness < minBrightness) {
        warnings.push('Imagem muito escura. Tente com mais iluminação')
        suggestions.push('Use uma foto com melhor iluminação para melhores resultados')
      } else if (brightness > maxBrightness) {
        warnings.push('Imagem muito clara. Pode perder detalhes')
        suggestions.push('Evite superexposição para preservar detalhes da roupa')
      }
    } catch (error) {
      // Ignora erro de brilho se não for crítico
      console.warn('Não foi possível calcular brilho:', error)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * Valida se a imagem parece ser de corpo inteiro (heurística simples)
 */
export function validateFullBodyImage(file: File): Promise<{ isFullBody: boolean; aspectRatio: number; suggestion?: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const aspectRatio = img.width / img.height
      
      // Imagens de corpo inteiro geralmente têm aspect ratio próximo de 2:3 ou 3:4 (vertical)
      // Aceita até 1.0 (quadrada) se altura for suficiente
      // Horizontal (aspectRatio > 1.0) geralmente não é corpo inteiro
      const isFullBody = aspectRatio >= 0.5 && aspectRatio <= 1.0 && img.height >= 800
      
      resolve({
        isFullBody,
        aspectRatio,
        suggestion: isFullBody 
          ? undefined 
          : aspectRatio > 1.0
          ? 'Foto horizontal não é adequada. Use foto vertical (proporção 2:3 ou 3:4)'
          : 'Para melhores resultados, use uma foto vertical de corpo inteiro (proporção 2:3 ou 3:4)',
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        isFullBody: false,
        aspectRatio: 0,
        suggestion: 'Erro ao validar imagem',
      })
    }

    img.src = url
  })
}

