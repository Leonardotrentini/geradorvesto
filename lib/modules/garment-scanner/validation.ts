/**
 * Validação Avançada da Imagem da Roupa
 * 
 * Baseado em:
 * - TryOnDiffusion: validação de resolução, foco, integridade
 * - VITON-HD: checagem de qualidade de imagem
 * - OOTDiffusion: validação de fundo e contraste
 */

import sharp from 'sharp'
import { GarmentValidation, ValidationIssue } from './types'

/**
 * Valida imagem da roupa com múltiplas checagens
 */
export async function validateGarmentImage(
  image: File | string
): Promise<GarmentValidation> {
  const issues: ValidationIssue[] = []
  const warnings: string[] = []
  let score = 10

  // Carrega imagem com sharp
  let imageBuffer: Buffer
  if (typeof image === 'string') {
    // Se for URL, faz fetch
    const response = await fetch(image)
    imageBuffer = Buffer.from(await response.arrayBuffer())
  } else {
    // Se for File, converte para Buffer
    imageBuffer = Buffer.from(await image.arrayBuffer())
  }

  const sharpImage = sharp(imageBuffer)
  const metadata = await sharpImage.metadata()
  const { width, height } = metadata

  if (!width || !height) {
    throw new Error('Não foi possível ler dimensões da imagem')
  }

  // Obtém dados da imagem (RGB)
  const { data, info } = await sharpImage
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true })

  // 1. VALIDAÇÃO DE RESOLUÇÃO
  const minResolution = 1024
  const idealResolution = 2048
  const maxDimension = Math.max(width, height)

  if (maxDimension < minResolution) {
    issues.push({
      type: 'resolution',
      severity: 'error',
      message: `Resolução muito baixa (${maxDimension}px). Mínimo: ${minResolution}px`,
    })
    score -= 3
  } else if (maxDimension < idealResolution) {
    warnings.push(`Resolução abaixo do ideal (${maxDimension}px). Recomendado: ${idealResolution}px+`)
    score -= 1
  }

  // 2. VALIDAÇÃO DE FOCO (BLUR DETECTION)
  const blurScore = detectBlur(data, width, height, info.channels)
  if (blurScore > 0.5) {
    issues.push({
      type: 'blur',
      severity: 'error',
      message: `Imagem muito desfocada (blur score: ${blurScore.toFixed(2)})`,
    })
    score -= 2
  } else if (blurScore > 0.3) {
    warnings.push(`Imagem levemente desfocada (blur score: ${blurScore.toFixed(2)})`)
    score -= 1
  }

  // 3. VALIDAÇÃO DE PEÇA INTEIRA (EDGE DETECTION)
  const isCut = detectCutGarment(data, width, height, info.channels)
  if (isCut) {
    issues.push({
      type: 'cut',
      severity: 'error',
      message: 'Peça parece estar cortada nas bordas da imagem',
    })
    score -= 2
  }

  // 4. VALIDAÇÃO DE FUNDO
  const backgroundScore = analyzeBackground(data, width, height, info.channels)
  if (backgroundScore < 0.5) {
    warnings.push('Fundo pode não ser ideal para segmentação (muito complexo ou similar à roupa)')
    score -= 1
  }

  // 5. VALIDAÇÃO DE CONTRASTE
  const contrastScore = calculateContrast(data, width, height, info.channels)
  if (contrastScore < 0.3) {
    warnings.push('Contraste baixo entre roupa e fundo. Pode dificultar segmentação')
    score -= 1
  }

  // Garante score mínimo de 0
  score = Math.max(0, score)

  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    score,
    issues,
    warnings,
  }
}


/**
 * Detecta blur usando Laplacian variance
 * Baseado em: https://pyimagesearch.com/2015/09/07/blur-detection-with-opencv/
 */
function detectBlur(data: Buffer, width: number, height: number, channels: number): number {
  // Converte para escala de cinza
  const gray: number[] = []
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    gray.push(0.299 * r + 0.587 * g + 0.114 * b)
  }

  // Calcula Laplacian (segunda derivada)
  let laplacianSum = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const laplacian = Math.abs(
        4 * gray[idx] -
        gray[(y - 1) * width + x] -
        gray[(y + 1) * width + x] -
        gray[y * width + (x - 1)] -
        gray[y * width + (x + 1)]
      )
      laplacianSum += laplacian
    }
  }

  const variance = laplacianSum / (width * height)
  // Normaliza para 0-1 (quanto maior, menos blur)
  // Valores típicos: > 100 = nítido, < 50 = blur
  return Math.max(0, Math.min(1, 1 - variance / 200))
}

/**
 * Detecta se peça está cortada nas bordas
 */
function detectCutGarment(data: Buffer, width: number, height: number, channels: number): boolean {
  // Verifica bordas da imagem por pixels não brancos (assumindo fundo branco)
  const edgeThreshold = 0.1 // 10% da borda
  const edgeWidth = Math.floor(width * edgeThreshold)
  const edgeHeight = Math.floor(height * edgeThreshold)

  // Verifica bordas superior, inferior, esquerda, direita
  const edges = [
    { x: 0, y: 0, w: width, h: edgeHeight }, // Topo
    { x: 0, y: height - edgeHeight, w: width, h: edgeHeight }, // Base
    { x: 0, y: 0, w: edgeWidth, h: height }, // Esquerda
    { x: width - edgeWidth, y: 0, w: edgeWidth, h: height }, // Direita
  ]

  for (const edge of edges) {
    let nonWhitePixels = 0
    for (let y = edge.y; y < edge.y + edge.h && y < height; y++) {
      for (let x = edge.x; x < edge.x + edge.w && x < width; x++) {
        const idx = (y * width + x) * channels
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        
        // Se não for branco (threshold 240)
        if (r < 240 || g < 240 || b < 240) {
          nonWhitePixels++
        }
      }
    }
    
    const nonWhiteRatio = nonWhitePixels / (edge.w * edge.h)
    // Se mais de 30% da borda não é branco, pode estar cortado
    if (nonWhiteRatio > 0.3) {
      return true
    }
  }

  return false
}

/**
 * Analisa qualidade do fundo
 */
function analyzeBackground(data: Buffer, width: number, height: number, channels: number): number {
  // Amostra bordas (assumindo fundo nas bordas)
  const sampleSize = Math.min(100, Math.floor(width * 0.1))
  const samples: number[] = []

  // Amostra cantos
  const corners = [
    { x: 0, y: 0 },
    { x: width - sampleSize, y: 0 },
    { x: 0, y: height - sampleSize },
    { x: width - sampleSize, y: height - sampleSize },
  ]

  for (const corner of corners) {
    let brightnessSum = 0
    let count = 0
    for (let y = corner.y; y < corner.y + sampleSize && y < height; y++) {
      for (let x = corner.x; x < corner.x + sampleSize && x < width; x++) {
        const idx = (y * width + x) * channels
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        brightnessSum += (r + g + b) / 3
        count++
      }
    }
    if (count > 0) {
      samples.push(brightnessSum / count)
    }
  }

  // Calcula variância (fundo uniforme = baixa variância = bom)
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length
  const variance = samples.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / samples.length
  
  // Normaliza: baixa variância = fundo uniforme = bom (score alto)
  return Math.max(0, Math.min(1, 1 - variance / 100))
}

/**
 * Calcula contraste entre roupa e fundo
 */
function calculateContrast(data: Buffer, width: number, height: number, channels: number): number {
  // Simplificado: calcula desvio padrão dos pixels (alto = alto contraste)
  const pixels: number[] = []
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    pixels.push((r + g + b) / 3)
  }

  const avg = pixels.reduce((a, b) => a + b, 0) / pixels.length
  const variance = pixels.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / pixels.length
  const stdDev = Math.sqrt(variance)

  // Normaliza para 0-1
  return Math.max(0, Math.min(1, stdDev / 128))
}

