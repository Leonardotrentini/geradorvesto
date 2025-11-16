/**
 * Validações avançadas para garantir resultados 10/10
 */

export interface AdvancedValidationResult {
  score: number // 0-10
  valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  details: {
    dimensions: { width: number; height: number; aspectRatio: number }
    brightness: number
    isWhiteBackground?: boolean
    isFullBody?: boolean
    quality: 'low' | 'medium' | 'high'
  }
}

/**
 * Valida se fundo é branco (análise de bordas)
 */
export async function validateWhiteBackground(file: File): Promise<{ isWhite: boolean; percentage: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível criar contexto'))
      return
    }

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Analisa bordas (10% de cada lado)
      const borderWidth = Math.min(50, Math.floor(canvas.width * 0.1))
      let whitePixels = 0
      let totalBorderPixels = 0

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (x < borderWidth || x >= canvas.width - borderWidth ||
              y < borderWidth || y >= canvas.height - borderWidth) {
            const idx = (y * canvas.width + x) * 4
            const r = data[idx]
            const g = data[idx + 1]
            const b = data[idx + 2]

            // Considera branco se R, G, B > 240
            if (r > 240 && g > 240 && b > 240) {
              whitePixels++
            }
            totalBorderPixels++
          }
        }
      }

      const percentage = (whitePixels / totalBorderPixels) * 100
      const isWhite = percentage > 60

      URL.revokeObjectURL(url)
      resolve({ isWhite, percentage })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Erro ao carregar imagem'))
    }

    img.src = url
  })
}

/**
 * Validação avançada completa
 */
export async function advancedValidation(
  file: File,
  options: {
    isPersonImage?: boolean
    isGarmentImage?: boolean
    minWidth?: number
    minHeight?: number
  } = {}
): Promise<AdvancedValidationResult> {
  const {
    isPersonImage = false,
    isGarmentImage = false,
    minWidth = isPersonImage ? 768 : 1024,
    minHeight = isPersonImage ? 1024 : 1024,
  } = options

  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []
  let score = 10

  // Carrega imagem para análise
  const img = new Image()
  const url = URL.createObjectURL(file)

  return new Promise((resolve, reject) => {
    img.onload = async () => {
      const width = img.width
      const height = img.height
      const aspectRatio = width / height

      // 1. Validação de dimensões
      if (width < minWidth || height < minHeight) {
        errors.push(`Dimensões insuficientes. Mínimo: ${minWidth}x${minHeight}px. Atual: ${width}x${height}px`)
        score -= 3
      } else if (width < minWidth * 1.5 || height < minHeight * 1.5) {
        warnings.push(`Resolução baixa. Recomendado: ${minWidth * 2}x${minHeight * 2}px`)
        score -= 1
      }

      // 2. Validação de proporção (para pessoa)
      if (isPersonImage) {
        // Corpo inteiro geralmente tem proporção vertical (aspectRatio < 0.8)
        if (aspectRatio > 0.8) {
          errors.push('Imagem não parece ser de corpo inteiro. Use foto vertical (proporção 2:3 ou 3:4)')
          score -= 2
        } else if (height < 1000) {
          errors.push('Altura insuficiente para corpo inteiro. Mínimo: 1000px')
          score -= 2
        }
      }

      // 3. Validação de fundo branco (para roupa)
      if (isGarmentImage) {
        try {
          const whiteBgCheck = await validateWhiteBackground(file)
          if (!whiteBgCheck.isWhite) {
            errors.push(`Fundo não é branco (${whiteBgCheck.percentage.toFixed(1)}% branco nas bordas). Use fundo branco puro para melhores resultados.`)
            score -= 2
          } else if (whiteBgCheck.percentage < 80) {
            warnings.push(`Fundo pode ser melhorado (${whiteBgCheck.percentage.toFixed(1)}% branco). Recomendado: 90%+`)
            score -= 1
          }
        } catch (error) {
          warnings.push('Não foi possível validar fundo branco')
        }
      }

      // 4. Análise de qualidade (brilho)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, width, height)
          const data = imageData.data

          let totalBrightness = 0
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b)
          }
          const avgBrightness = totalBrightness / (data.length / 4)

          if (avgBrightness < 60) {
            warnings.push('Imagem muito escura. Use melhor iluminação')
            score -= 1
            suggestions.push('Tire a foto com mais luz natural ou artificial')
          } else if (avgBrightness > 200) {
            warnings.push('Imagem muito clara. Pode perder detalhes')
            score -= 1
            suggestions.push('Evite superexposição')
          }
        }
      } catch (error) {
        // Ignora erro de brilho
      }

      // 5. Determina qualidade geral
      let quality: 'low' | 'medium' | 'high' = 'high'
      if (score < 6) quality = 'low'
      else if (score < 8) quality = 'medium'

      URL.revokeObjectURL(url)

      resolve({
        score: Math.max(0, Math.min(10, score)),
        valid: errors.length === 0,
        errors,
        warnings,
        suggestions,
        details: {
          dimensions: { width, height, aspectRatio },
          brightness: 0, // Será calculado se necessário
          isWhiteBackground: isGarmentImage ? (await validateWhiteBackground(file)).isWhite : undefined,
          isFullBody: isPersonImage ? aspectRatio < 0.8 : undefined,
          quality,
        },
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Erro ao carregar imagem'))
    }

    img.src = url
  })
}

