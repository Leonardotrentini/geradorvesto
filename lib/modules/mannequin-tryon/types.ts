/**
 * Tipos para Módulo 3: Try-on em Manequim
 */

export interface MannequinTemplate {
  template_id: string
  gender: 'homem' | 'mulher'
  pose: 'front' | 'side' | 'three-quarter'
  image_url: string // URL da imagem do template
  mask_url: string // URL da máscara pré-calculada
  garment_mask_url: string // URL da máscara da área da roupa
  dimensions: {
    width: number
    height: number
  }
}

export interface MannequinTryOnRequest {
  garment_id: string // Do Módulo 1
  template_id?: string // Se não especificado, seleciona automaticamente
  gender: 'homem' | 'mulher'
}

export interface MannequinTryOnResult {
  job_id: string
  template_id: string
  garment_id: string
  result_image: string // URL da imagem final
  status: 'processing' | 'completed' | 'failed'
  created_at: Date
}

