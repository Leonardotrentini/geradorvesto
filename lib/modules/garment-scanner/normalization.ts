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

import sharp from 'sharp'
import { put } from '@vercel/blob'

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
  const imageResponse = await fetch(input.croppedImage)
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
  
  const maskResponse = await fetch(input.mask)
  const maskBuffer = Buffer.from(await maskResponse.arrayBuffer())

  const imageSharp = sharp(imageBuffer)
  const maskSharp = sharp(maskBuffer)
  
  const imageMetadata = await imageSharp.metadata()
  const { width: originalWidth, height: originalHeight } = imageMetadata

  if (!originalWidth || !originalHeight) {
    throw new Error('Não foi possível ler dimensões da imagem')
  }

  // ETAPA 2: Calcular dimensões mantendo proporção
  const aspectRatio = originalWidth / originalHeight
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
  const resizedImage = await imageSharp
    .resize(targetWidth, targetHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer()

  const resizedMask = await maskSharp
    .resize(targetWidth, targetHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer()

  // ETAPA 4: Centralizar em canvas 1024x1024
  const centeredImage = await sharp({
    create: {
      width: STANDARD_SIZE,
      height: STANDARD_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparente
    },
  })
    .composite([
      {
        input: resizedImage,
        left: Math.floor((STANDARD_SIZE - targetWidth) / 2),
        top: Math.floor((STANDARD_SIZE - targetHeight) / 2),
      },
    ])
    .png()
    .toBuffer()

  const centeredMask = await sharp({
    create: {
      width: STANDARD_SIZE,
      height: STANDARD_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparente
    },
  })
    .composite([
      {
        input: resizedMask,
        left: Math.floor((STANDARD_SIZE - targetWidth) / 2),
        top: Math.floor((STANDARD_SIZE - targetHeight) / 2),
      },
    ])
    .png()
    .toBuffer()

  // ETAPA 5: Ajustar contraste/exposição
  const adjustedImage = await sharp(centeredImage)
    .modulate({
      brightness: 1.0, // Sem ajuste de brilho
      saturation: 1.0,
    })
    .normalize() // Normaliza contraste
    .png()
    .toBuffer()

  // ETAPA 6: Upload das imagens normalizadas
  const normalizedImageUrl = await uploadImage(adjustedImage, 'normalized-image')
  const normalizedMaskUrl = await uploadImage(centeredMask, 'normalized-mask')

  console.log('✅ Normalização concluída')
  console.log(`   - Dimensões originais: ${originalWidth}x${originalHeight}`)
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
 * Upload imagem para storage
 */
async function uploadImage(buffer: Buffer, prefix: string): Promise<string> {
  const fileName = `${prefix}-${Date.now()}.png`
  const result = await put(fileName, buffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'image/png',
  })

  return result.url
}

