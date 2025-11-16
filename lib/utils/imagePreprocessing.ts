/**
 * Utilitários para pré-processamento de imagens
 * Melhora a qualidade das imagens antes de enviar para o Vella
 */

/**
 * Analisa a proporção de uma imagem para detectar tipo de roupa
 */
export async function detectGarmentType(imageUrl: string): Promise<'dress' | 'top' | 'bottom'> {
  try {
    // Carrega a imagem
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })

    const width = img.width
    const height = img.height
    const aspectRatio = width / height

    console.log('🔵 Analisando imagem da roupa...')
    console.log('🔵 Dimensões:', width, 'x', height)
    console.log('🔵 Proporção:', aspectRatio.toFixed(2))

    // Vestidos geralmente são mais longos (proporção menor que 0.8)
    if (aspectRatio < 0.8) {
      console.log('✅ Detectado: VESTIDO (proporção vertical)')
      return 'dress'
    }
    
    // Tops são mais quadrados ou horizontais (proporção entre 0.8 e 1.2)
    if (aspectRatio >= 0.8 && aspectRatio <= 1.2) {
      console.log('✅ Detectado: TOP/BLUSA (proporção quadrada)')
      return 'top'
    }
    
    // Bottoms são mais largos (proporção maior que 1.2)
    console.log('✅ Detectado: BOTTOM/CALÇA (proporção horizontal)')
    return 'bottom'
  } catch (error: any) {
    console.warn('⚠️ Erro ao detectar tipo de roupa:', error.message)
    // Fallback: assume que é top (mais comum)
    return 'top'
  }
}

/**
 * Valida se a imagem da roupa está isolada (fundo branco/transparente)
 * Análise simples baseada em brilho médio
 */
export async function validateIsolatedGarment(imageUrl: string): Promise<{ isolated: boolean; confidence: number }> {
  try {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return { isolated: false, confidence: 0 }
    }

    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Analisa bordas da imagem (onde geralmente está o fundo)
    let whitePixels = 0
    let totalBorderPixels = 0

    // Analisa bordas (topo, baixo, esquerda, direita)
    const borderWidth = Math.min(50, Math.floor(canvas.width * 0.1))
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        // Verifica se está na borda
        if (x < borderWidth || x >= canvas.width - borderWidth || 
            y < borderWidth || y >= canvas.height - borderWidth) {
          const idx = (y * canvas.width + x) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]
          
          // Considera branco se R, G, B estão todos acima de 240
          if (r > 240 && g > 240 && b > 240) {
            whitePixels++
          }
          totalBorderPixels++
        }
      }
    }

    const whitePercentage = (whitePixels / totalBorderPixels) * 100
    const isolated = whitePercentage > 60 // Se mais de 60% das bordas são brancas
    const confidence = Math.min(100, whitePercentage)

    console.log('🔵 Validação de roupa isolada:')
    console.log('🔵 Pixels brancos nas bordas:', whitePercentage.toFixed(1) + '%')
    console.log('🔵 Isolada:', isolated ? 'SIM' : 'NÃO')
    console.log('🔵 Confiança:', confidence.toFixed(1) + '%')

    return { isolated, confidence }
  } catch (error: any) {
    console.warn('⚠️ Erro ao validar roupa isolada:', error.message)
    return { isolated: true, confidence: 50 } // Assume que está OK se não conseguir validar
  }
}

/**
 * Valida se a imagem da pessoa é de corpo inteiro
 */
export async function validateFullBody(imageUrl: string): Promise<{ fullBody: boolean; confidence: number }> {
  try {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })

    const width = img.width
    const height = img.height
    const aspectRatio = width / height

    // Corpo inteiro geralmente tem proporção vertical (menor que 0.8)
    const isVertical = aspectRatio < 0.8
    const minHeight = 1000 // Altura mínima recomendada
    const fullBody = isVertical && height >= minHeight
    const confidence = isVertical ? (height >= minHeight ? 100 : 70) : 30

    console.log('🔵 Validação de corpo inteiro:')
    console.log('🔵 Dimensões:', width, 'x', height)
    console.log('🔵 Proporção:', aspectRatio.toFixed(2))
    console.log('🔵 Corpo inteiro:', fullBody ? 'SIM' : 'NÃO')
    console.log('🔵 Confiança:', confidence + '%')

    return { fullBody, confidence }
  } catch (error: any) {
    console.warn('⚠️ Erro ao validar corpo inteiro:', error.message)
    return { fullBody: true, confidence: 50 }
  }
}

