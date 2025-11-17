/**
 * Tipos para Módulo 1: Scan da Peça (Garment Digital)
 */

export interface GarmentScanRequest {
  image: File | string // URL ou File da imagem da roupa
}

export interface GarmentScanResult {
  garment_id: string
  garment_image: string // URL do PNG recortado (fundo transparente)
  garment_mask: string // URL da máscara em alta resolução
  metadata: GarmentMetadata
  created_at: Date
}

export interface GarmentMetadata {
  type: GarmentType
  color: string
  pattern: GarmentPattern
  dimensions: {
    width: number
    height: number
  }
  quality_score: number // 0-10
}

export type GarmentType = 
  | 'dress' 
  | 'top' 
  | 'bottom' 
  | 'jumpsuit' 
  | 'jacket' 
  | 'other'

export type GarmentPattern = 
  | 'solid' 
  | 'striped' 
  | 'patterned' 
  | 'printed' 
  | 'other'

export interface GarmentValidation {
  isValid: boolean
  score: number // 0-10
  issues: ValidationIssue[]
  warnings: string[]
}

export interface ValidationIssue {
  type: 'resolution' | 'blur' | 'cut' | 'background' | 'focus'
  severity: 'error' | 'warning'
  message: string
}

