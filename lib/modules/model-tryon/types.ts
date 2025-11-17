/**
 * Tipos para Módulo 2: Try-on em Modelo (Avatar Humano)
 */

export interface ModelTryOnRequest {
  garment_id: string // Do Módulo 1
  person_image: File | string // URL ou File da imagem da pessoa
  use_default_model?: boolean // Se true, usa modelo padrão do sistema
}

export interface ModelTryOnResult {
  job_id: string
  garment_id: string
  result_image: string // URL da imagem final (formato 2:3)
  status: 'processing' | 'completed' | 'failed'
  created_at: Date
}

