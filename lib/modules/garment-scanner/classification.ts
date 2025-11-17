/**
 * Classificação da Peça
 * 
 * Detecta:
 * - Tipo (vestido, blusa, shorts, calça, etc.)
 * - Cor principal
 * - Padrão (liso, estampado, listrado, etc.)
 * 
 * Baseado em:
 * - Modelos de classificação de moda
 * - Análise de cor dominante
 * - Detecção de padrões
 */

import sharp from 'sharp'
import { GarmentMetadata } from './types'

export interface ClassificationResult {
  type: GarmentMetadata['type']
  color: string
  pattern: GarmentMetadata['pattern']
}

/**
 * Classifica garment (tipo, cor, padrão)
 */
export async function classifyGarment(
  imageUrl: string
): Promise<ClassificationResult> {
  console.log('🔵 Classificando garment...')

  // ETAPA 1: Detectar tipo (por análise de forma e proporção)
  const type = await detectGarmentType(imageUrl)

  // ETAPA 2: Detectar cor principal
  const color = await detectDominantColor(imageUrl)

  // ETAPA 3: Detectar padrão
  const pattern = await detectPattern(imageUrl)

  console.log(`✅ Classificação: ${type}, ${color}, ${pattern}`)

  return {
    type,
    color,
    pattern,
  }
}

/**
 * Detecta tipo de roupa por análise de forma
 */
async function detectGarmentType(imageUrl: string): Promise<GarmentMetadata['type']> {
  // Carrega imagem
  const response = await fetch(imageUrl)
  const buffer = Buffer.from(await response.arrayBuffer())
  const sharpImage = sharp(buffer)
  const metadata = await sharpImage.metadata()
  const { width, height } = metadata

  if (!width || !height) {
    throw new Error('Não foi possível ler dimensões da imagem')
  }

  // Obtém dados da imagem para análise
  const { data, info } = await sharpImage
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true })

  // Análise heurística baseada em:
  // - Proporção altura/largura
  // - Distribuição de pixels não transparentes
  // - Forma geral

  const aspectRatio = width / height
  const nonTransparentPixels = countNonTransparentPixels(data, width, height, info.channels)
  const coverageRatio = nonTransparentPixels / (width * height)

  // Heurísticas:
  // - Vestido: geralmente mais alto que largo, cobertura média-alta
  // - Top/Blusa: proporção mais quadrada, cobertura média
  // - Bottom: proporção mais larga, cobertura baixa-média
  // - Jumpsuit: muito alto, cobertura alta

  if (aspectRatio < 0.7 && coverageRatio > 0.6) {
    // Muito alto e muita cobertura = provavelmente vestido longo ou jumpsuit
    if (coverageRatio > 0.8) {
      return 'jumpsuit'
    }
    return 'dress'
  } else if (aspectRatio > 1.2) {
    // Mais largo que alto = provavelmente bottom
    return 'bottom'
  } else if (coverageRatio < 0.4) {
    // Pouca cobertura = provavelmente top
    return 'top'
  } else {
    // Padrão: tenta inferir pelo nome da URL
    const lowerUrl = imageUrl.toLowerCase()
    if (lowerUrl.includes('dress') || lowerUrl.includes('vestido')) {
      return 'dress'
    } else if (lowerUrl.includes('top') || lowerUrl.includes('blusa')) {
      return 'top'
    } else if (lowerUrl.includes('pants') || lowerUrl.includes('calça')) {
      return 'bottom'
    } else if (lowerUrl.includes('jacket') || lowerUrl.includes('casaco')) {
      return 'jacket'
    }
  }

  // Padrão: assume dress (mais comum em e-commerce)
  return 'dress'
}

/**
 * Detecta cor dominante
 */
async function detectDominantColor(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl)
  const buffer = Buffer.from(await response.arrayBuffer())
  const sharpImage = sharp(buffer)
  const { data, info } = await sharpImage
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true })

  // Agrupa cores em buckets
  const colorBuckets: { [key: string]: number } = {}
  const channels = info.channels

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = channels > 3 ? data[i + 3] : 255

    // Ignora pixels transparentes
    if (a < 128) continue

    // Quantiza cores (agrupa cores similares)
    const quantizedR = Math.floor(r / 32) * 32
    const quantizedG = Math.floor(g / 32) * 32
    const quantizedB = Math.floor(b / 32) * 32
    const key = `${quantizedR},${quantizedG},${quantizedB}`

    colorBuckets[key] = (colorBuckets[key] || 0) + 1
  }

  // Encontra cor mais frequente
  let maxCount = 0
  let dominantKey = ''
  for (const [key, count] of Object.entries(colorBuckets)) {
    if (count > maxCount) {
      maxCount = count
      dominantKey = key
    }
  }

  // Converte para nome de cor
  if (dominantKey) {
    const [r, g, b] = dominantKey.split(',').map(Number)
    return rgbToColorName(r, g, b)
  }

  return 'elegant' // Fallback
}

/**
 * Converte RGB para nome de cor
 */
function rgbToColorName(r: number, g: number, b: number): string {
  // Mapeamento básico de cores
  const colors: { [key: string]: [number, number, number] } = {
    'red': [255, 0, 0],
    'blue': [0, 0, 255],
    'green': [0, 255, 0],
    'black': [0, 0, 0],
    'white': [255, 255, 255],
    'yellow': [255, 255, 0],
    'orange': [255, 165, 0],
    'pink': [255, 192, 203],
    'purple': [128, 0, 128],
    'brown': [165, 42, 42],
    'gray': [128, 128, 128],
    'beige': [245, 245, 220],
  }

  let minDistance = Infinity
  let closestColor = 'elegant'

  for (const [name, [cr, cg, cb]] of Object.entries(colors)) {
    const distance = Math.sqrt(
      Math.pow(r - cr, 2) + Math.pow(g - cg, 2) + Math.pow(b - cb, 2)
    )
    if (distance < minDistance) {
      minDistance = distance
      closestColor = name
    }
  }

  return closestColor
}

/**
 * Detecta padrão (liso, estampado, etc.)
 */
async function detectPattern(imageUrl: string): Promise<GarmentMetadata['pattern']> {
  const response = await fetch(imageUrl)
  const buffer = Buffer.from(await response.arrayBuffer())
  const sharpImage = sharp(buffer)
  const metadata = await sharpImage.metadata()
  const { width, height } = metadata

  if (!width || !height) {
    throw new Error('Não foi possível ler dimensões da imagem')
  }

  const { data, info } = await sharpImage
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true })

  const channels = info.channels

  // Calcula variância de cores (alto = estampado, baixo = liso)
  const colorVariances: number[] = []

  for (let i = 0; i < data.length; i += channels * 4) { // Amostra a cada 4 pixels
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = channels > 3 ? data[i + 3] : 255

    if (a < 128) continue

    // Calcula variância local (comparando com pixels vizinhos)
    if (i + channels * 4 < data.length) {
      const nextR = data[i + channels * 4]
      const nextG = data[i + channels * 4 + 1]
      const nextB = data[i + channels * 4 + 2]

      const variance = Math.sqrt(
        Math.pow(r - nextR, 2) + Math.pow(g - nextG, 2) + Math.pow(b - nextB, 2)
      )
      colorVariances.push(variance)
    }
  }

  if (colorVariances.length === 0) {
    return 'solid'
  }

  const avgVariance = colorVariances.reduce((a, b) => a + b, 0) / colorVariances.length

  // Thresholds:
  // - < 30: liso (solid)
  // - 30-60: possivelmente estampado
  // - > 60: definitivamente estampado

  if (avgVariance < 30) {
    return 'solid'
  } else if (avgVariance > 60) {
    return 'printed'
  } else {
    // Verifica se tem padrão de listras
    const hasStripes = detectStripes(imageData)
    if (hasStripes) {
      return 'striped'
    }
    return 'patterned'
  }
}

/**
 * Detecta se tem padrão de listras
 */
function detectStripes(data: Buffer, width: number, height: number, channels: number): boolean {
  // Análise simplificada: verifica se há linhas horizontais ou verticais repetitivas
  // TODO: Implementar detecção mais sofisticada
  return false
}

/**
 * Conta pixels não transparentes
 */
function countNonTransparentPixels(data: Buffer, width: number, height: number, channels: number): number {
  let count = 0
  const alphaIndex = channels > 3 ? 3 : -1
  
  if (alphaIndex > 0) {
    for (let i = alphaIndex; i < data.length; i += channels) {
      if (data[i] > 128) {
        count++
      }
    }
  } else {
    // Se não tem alpha, conta todos os pixels
    count = (width * height)
  }
  
  return count
}

