/**
 * Normalização e Padronização do Garment
 * 
 * Baseado em:
 * - TryOnDiffusion: normalização para canvas padrão
 * - VITON-HD: centralização e ajuste de escala
 * - OOTDiffusion: correção de cor e exposição
 * 
 * Processo:
 * 1. Redimensionar para canvas padrão (1024x1024)
 * 2. Centralizar peça
 * 3. Ajustar contraste/exposição
 * 4. Gerar máscara normalizada
 */

export interface NormalizationResult {
  normalizedImage: string // URL da imagem normalizada
  normalizedMask: string // URL da máscara normalizada
  dimensions: {
    width: number
    height: number
  }
}

/**
 * Normaliza garment para formato padrão
 */
export async function normalizeGarment(input: {
  croppedImage: string
  mask: string
}): Promise<NormalizationResult> {
  console.log('🔵 Normalizando garment...')

  // Canvas padrão
  const STANDARD_SIZE = 1024

  // ETAPA 1: Carregar imagem e máscara
  const image = await loadImage(input.croppedImage)
  const mask = await loadImage(input.mask)

  // ETAPA 2: Calcular dimensões mantendo proporção
  const aspectRatio = image.width / image.height
  let targetWidth = STANDARD_SIZE
  let targetHeight = STANDARD_SIZE

  if (aspectRatio > 1) {
    // Largura maior
    targetHeight = Math.round(STANDARD_SIZE / aspectRatio)
  } else {
    // Altura maior
    targetWidth = Math.round(STANDARD_SIZE * aspectRatio)
  }

  // ETAPA 3: Redimensionar mantendo proporção
  const resizedImage = await resizeImage(image, targetWidth, targetHeight)
  const resizedMask = await resizeImage(mask, targetWidth, targetHeight)

  // ETAPA 4: Centralizar em canvas 1024x1024
  const centeredImage = await centerOnCanvas(resizedImage, STANDARD_SIZE, STANDARD_SIZE)
  const centeredMask = await centerOnCanvas(resizedMask, STANDARD_SIZE, STANDARD_SIZE)

  // ETAPA 5: Ajustar contraste/exposição
  const adjustedImage = await adjustImage(centeredImage)

  // ETAPA 6: Upload das imagens normalizadas
  const normalizedImageUrl = await uploadImage(adjustedImage)
  const normalizedMaskUrl = await uploadImage(centeredMask)

  console.log('✅ Normalização concluída')
  console.log(`   - Dimensões originais: ${image.width}x${image.height}`)
  console.log(`   - Dimensões normalizadas: ${STANDARD_SIZE}x${STANDARD_SIZE}`)

  return {
    normalizedImage: normalizedImageUrl,
    normalizedMask: normalizedMaskUrl,
    dimensions: {
      width: STANDARD_SIZE,
      height: STANDARD_SIZE,
    },
  }
}

/**
 * Carrega imagem de URL
 */
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Erro ao carregar imagem'))
    img.src = url
  })
}

/**
 * Redimensiona imagem mantendo proporção
 */
async function resizeImage(
  image: HTMLImageElement,
  width: number,
  height: number
): Promise<HTMLImageElement> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível criar canvas')

  canvas.width = width
  canvas.height = height
  ctx.drawImage(image, 0, 0, width, height)

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = canvas.toDataURL('image/png')
  })
}

/**
 * Centraliza imagem em canvas maior
 */
async function centerOnCanvas(
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
): Promise<HTMLImageElement> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível criar canvas')

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  // Fundo transparente
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // Centraliza imagem
  const x = (canvasWidth - image.width) / 2
  const y = (canvasHeight - image.height) / 2
  ctx.drawImage(image, x, y)

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = canvas.toDataURL('image/png')
  })
}

/**
 * Ajusta contraste e exposição
 */
async function adjustImage(image: HTMLImageElement): Promise<HTMLImageElement> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível criar canvas')

  canvas.width = image.width
  canvas.height = image.height
  ctx.drawImage(image, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Ajusta contraste e brilho
  const contrast = 1.1 // Aumenta contraste levemente
  const brightness = 0 // Sem ajuste de brilho

  for (let i = 0; i < data.length; i += 4) {
    // Aplica contraste
    data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128 + brightness))
    data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128 + brightness))
    data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128 + brightness))
    // Alpha mantido
  }

  ctx.putImageData(imageData, 0, 0)

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = canvas.toDataURL('image/png')
  })
}

/**
 * Upload imagem para storage
 */
async function uploadImage(image: HTMLImageElement): Promise<string> {
  // Converte para blob
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível criar canvas')

  canvas.width = image.width
  canvas.height = image.height
  ctx.drawImage(image, 0, 0)

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else throw new Error('Erro ao converter para blob')
    }, 'image/png')
  })

  // Upload para Vercel Blob Storage
  const { put } = await import('@vercel/blob')
  const fileName = `normalized-${Date.now()}.png`
  const result = await put(fileName, blob, {
    access: 'public',
    addRandomSuffix: true,
  })

  return result.url
}

