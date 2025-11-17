/**
 * MÓDULO 1: SCAN DA PEÇA (GARMENT DIGITAL)
 * 
 * Pipeline completa de escaneamento de roupa:
 * 1. Validação avançada
 * 2. Segmentação precisa (Omnious + Stability)
 * 3. Remoção de fundo
 * 4. Normalização e padronização
 * 5. Classificação (tipo, cor, padrão)
 * 6. Armazenamento com garment_id
 * 
 * Baseado nas melhores práticas do mercado:
 * - TryOnDiffusion
 * - VITON-HD
 * - OOTDiffusion
 * - IDM-VTON
 */

import { GarmentScanRequest, GarmentScanResult, GarmentValidation, GarmentMetadata } from './types'
import { validateGarmentImage } from './validation'
import { segmentGarment } from './segmentation'
import { normalizeGarment } from './normalization'
import { classifyGarment } from './classification'
import { storeGarment } from './storage'

/**
 * Pipeline principal de scan da peça
 */
export async function scanGarment(
  request: GarmentScanRequest
): Promise<GarmentScanResult> {
  console.log('🔵 ========================================')
  console.log('🔵 MÓDULO 1: SCAN DA PEÇA')
  console.log('🔵 ========================================')

  // ETAPA 1: Validação Avançada
  console.log('🔵 ETAPA 1: Validação avançada...')
  const validation = await validateGarmentImage(request.image)
  
  if (!validation.isValid) {
    const errors = validation.issues
      .filter(i => i.severity === 'error')
      .map(i => i.message)
      .join(', ')
    throw new Error(`Imagem inválida: ${errors}`)
  }

  if (validation.score < 6) {
    console.warn(`⚠️ Qualidade baixa (${validation.score}/10). Continuando mesmo assim...`)
  }

  console.log(`✅ Validação OK - Score: ${validation.score}/10`)

  // ETAPA 2: Segmentação Precisa
  console.log('🔵 ETAPA 2: Segmentação precisa da roupa...')
  const segmentationResult = await segmentGarment(request.image)
  
  console.log('✅ Segmentação concluída')
  console.log(`   - Imagem recortada: ${segmentationResult.croppedImage.substring(0, 80)}...`)
  console.log(`   - Máscara: ${segmentationResult.mask.substring(0, 80)}...`)

  // ETAPA 3: Normalização e Padronização
  console.log('🔵 ETAPA 3: Normalização e padronização...')
  const normalizedResult = await normalizeGarment({
    croppedImage: segmentationResult.croppedImage,
    mask: segmentationResult.mask,
  })

  console.log('✅ Normalização concluída')
  console.log(`   - Dimensões: ${normalizedResult.dimensions.width}x${normalizedResult.dimensions.height}`)
  console.log(`   - Canvas padronizado: 1024x1024`)

  // ETAPA 4: Classificação (Tipo, Cor, Padrão)
  console.log('🔵 ETAPA 4: Classificação da peça...')
  const classification = await classifyGarment(normalizedResult.normalizedImage)
  
  console.log('✅ Classificação concluída')
  console.log(`   - Tipo: ${classification.type}`)
  console.log(`   - Cor: ${classification.color}`)
  console.log(`   - Padrão: ${classification.pattern}`)

  // ETAPA 5: Armazenamento e Geração de ID
  console.log('🔵 ETAPA 5: Armazenamento...')
  const garmentId = `garment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  
  const metadata: GarmentMetadata = {
    type: classification.type,
    color: classification.color,
    pattern: classification.pattern,
    dimensions: normalizedResult.dimensions,
    quality_score: validation.score,
  }

  const storedResult = await storeGarment({
    garment_id: garmentId,
    garment_image: normalizedResult.normalizedImage,
    garment_mask: normalizedResult.normalizedMask,
    metadata,
  })

  console.log('✅ Armazenamento concluído')
  console.log(`   - Garment ID: ${garmentId}`)

  console.log('🔵 ========================================')
  console.log('✅ SCAN DA PEÇA CONCLUÍDO COM SUCESSO')
  console.log('🔵 ========================================')

  return {
    garment_id: garmentId,
    garment_image: storedResult.garment_image_url,
    garment_mask: storedResult.garment_mask_url,
    metadata,
    created_at: new Date(),
  }
}

/**
 * Verifica status de um scan em andamento
 */
export async function getScanStatus(garmentId: string): Promise<GarmentScanResult | null> {
  // TODO: Implementar busca no storage
  return null
}

