/**
 * Armazenamento do Garment Digital
 * 
 * Salva:
 * - garment_id
 * - garment_image (PNG recortado)
 * - garment_mask (máscara)
 * - metadata (tipo, cor, padrão, dimensões, qualidade)
 * 
 * Por enquanto usa Vercel Blob Storage
 * Futuro: pode migrar para banco de dados
 */

import { put } from '@vercel/blob'
import { GarmentMetadata } from './types'

export interface StoreGarmentRequest {
  garment_id: string
  garment_image: string // URL da imagem normalizada
  garment_mask: string // URL da máscara
  metadata: GarmentMetadata
}

export interface StoreGarmentResult {
  garment_image_url: string
  garment_mask_url: string
}

/**
 * Armazena garment digital
 */
export async function storeGarment(
  request: StoreGarmentRequest
): Promise<StoreGarmentResult> {
  console.log(`🔵 Armazenando garment ${request.garment_id}...`)

  // Por enquanto, as URLs já estão no Vercel Blob
  // Futuro: pode salvar metadados em banco de dados
  
  // TODO: Implementar armazenamento de metadados
  // - Salvar em banco de dados (PostgreSQL, MongoDB, etc.)
  // - Ou usar Vercel KV para metadados simples
  // - garment_id -> { metadata, created_at, etc. }

  console.log('✅ Garment armazenado')
  console.log(`   - Image: ${request.garment_image.substring(0, 80)}...`)
  console.log(`   - Mask: ${request.garment_mask.substring(0, 80)}...`)

  return {
    garment_image_url: request.garment_image,
    garment_mask_url: request.garment_mask,
  }
}

/**
 * Busca garment por ID
 */
export async function getGarment(garmentId: string): Promise<StoreGarmentRequest | null> {
  // TODO: Implementar busca no storage
  return null
}

