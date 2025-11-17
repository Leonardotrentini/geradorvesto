/**
 * Biblioteca de Templates de Manequim
 * 
 * CRÍTICO: NÃO gerar manequim do zero
 * Sempre usar templates fixos pré-calculados
 */

import { MannequinTemplate } from './types'

/**
 * Templates de manequim disponíveis
 * 
 * Cada template deve ser:
 * - Alta resolução (2048px altura ideal)
 * - Fundo preto sólido
 * - Luz de estúdio profissional
 * - Pose premium fixa
 * - Estilo idêntico à imagem 2 de referência
 */
export const MANNEQUIN_TEMPLATES: MannequinTemplate[] = [
  // TODO: Adicionar templates reais quando tiver as imagens
  // Por enquanto, estrutura base
  {
    template_id: 'woman-front-001',
    gender: 'mulher',
    pose: 'front',
    image_url: '/mannequins/woman-front-001.jpg',
    mask_url: '/mannequins/masks/woman-front-001-mask.png',
    garment_mask_url: '/mannequins/masks/woman-front-001-garment-mask.png',
    dimensions: {
      width: 1024,
      height: 2048,
    },
  },
  {
    template_id: 'woman-side-001',
    gender: 'mulher',
    pose: 'side',
    image_url: '/mannequins/woman-side-001.jpg',
    mask_url: '/mannequins/masks/woman-side-001-mask.png',
    garment_mask_url: '/mannequins/masks/woman-side-001-garment-mask.png',
    dimensions: {
      width: 1024,
      height: 2048,
    },
  },
  {
    template_id: 'man-front-001',
    gender: 'homem',
    pose: 'front',
    image_url: '/mannequins/man-front-001.jpg',
    mask_url: '/mannequins/masks/man-front-001-mask.png',
    garment_mask_url: '/mannequins/masks/man-front-001-garment-mask.png',
    dimensions: {
      width: 1024,
      height: 2048,
    },
  },
  {
    template_id: 'man-side-001',
    gender: 'homem',
    pose: 'side',
    image_url: '/mannequins/man-side-001.jpg',
    mask_url: '/mannequins/masks/man-side-001-mask.png',
    garment_mask_url: '/mannequins/masks/man-side-001-garment-mask.png',
    dimensions: {
      width: 1024,
      height: 2048,
    },
  },
]

/**
 * Seleciona template de manequim baseado em gênero e pose
 */
export function selectMannequinTemplate(
  gender: 'homem' | 'mulher',
  pose?: 'front' | 'side' | 'three-quarter',
  templateId?: string
): MannequinTemplate {
  // Se template_id especificado, retorna ele
  if (templateId) {
    const template = MANNEQUIN_TEMPLATES.find(t => t.template_id === templateId)
    if (template) return template
  }

  // Filtra por gênero
  const genderTemplates = MANNEQUIN_TEMPLATES.filter(t => t.gender === gender)

  // Se pose especificada, filtra por pose
  if (pose) {
    const poseTemplate = genderTemplates.find(t => t.pose === pose)
    if (poseTemplate) return poseTemplate
  }

  // Retorna primeiro template do gênero (padrão: front)
  const defaultTemplate = genderTemplates.find(t => t.pose === 'front') || genderTemplates[0]

  if (!defaultTemplate) {
    throw new Error(`Nenhum template de manequim encontrado para gênero: ${gender}`)
  }

  return defaultTemplate
}

/**
 * Obtém todos os templates disponíveis
 */
export function getAllTemplates(): MannequinTemplate[] {
  return MANNEQUIN_TEMPLATES
}

/**
 * Obtém templates por gênero
 */
export function getTemplatesByGender(gender: 'homem' | 'mulher'): MannequinTemplate[] {
  return MANNEQUIN_TEMPLATES.filter(t => t.gender === gender)
}

