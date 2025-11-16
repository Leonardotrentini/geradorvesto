export type Gender = 'homem' | 'mulher' | 'nao-binario';
export type Scenario = 'avatar' | 'rua' | 'cenario';
export type BodyShape = 'magro' | 'atletico' | 'medio' | 'robusto' | 'plus-size';
export type AgeRange = '18-25' | '26-35' | '36-45' | '46-55' | '56-70';
export type HairColor = 'preto' | 'castanho' | 'loiro' | 'ruivo' | 'colorido';
export type HairStyle = 'curto' | 'medio' | 'longo' | 'cacheado' | 'liso';
export type Height = 'baixo' | 'medio' | 'alto';
export type ScenarioType = 'estudio' | 'praia' | 'parque' | 'loja' | 'evento' | 'urbano';

export interface AvatarConfig {
  gender: Gender;
  age: number | AgeRange;
  bodyShape: BodyShape;
  hairColor?: HairColor;
  hairStyle?: HairStyle;
  height?: Height;
  ethnicity?: string;
}

export interface GenerationConfig {
  productImage: File | string;
  avatar: AvatarConfig;
  scenario: Scenario;
  scenarioType?: ScenarioType;
  style?: string;
}

export interface GenerationResult {
  id: string;
  images: string[]; // URLs das 4 variações
  config: GenerationConfig;
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
}


