import { z } from 'zod';

export const imageFileSchema = z.object({
  name: z.string(),
  size: z.number().max(10 * 1024 * 1024, 'Arquivo muito grande (máx. 10MB)'),
  type: z.string().refine(
    (type) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(type),
    'Formato não suportado. Use JPG, PNG ou WebP'
  ),
});

export const generationConfigSchema = z.object({
  productImage: z.union([z.instanceof(File), z.string()]),
  avatar: z.object({
    gender: z.enum(['homem', 'mulher', 'nao-binario']),
    age: z.union([z.number().min(18).max(70), z.string()]),
    bodyShape: z.enum(['magro', 'atletico', 'medio', 'robusto', 'plus-size']),
    hairColor: z.string().optional(),
    hairStyle: z.string().optional(),
    height: z.string().optional(),
    ethnicity: z.string().optional(),
  }),
  scenario: z.enum(['avatar', 'rua', 'cenario']),
  scenarioType: z.string().optional(),
  style: z.string().optional(),
});

export type ImageFileInput = z.infer<typeof imageFileSchema>;
export type GenerationConfigInput = z.infer<typeof generationConfigSchema>;


