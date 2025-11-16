import { GenerationConfig, GenerationResult } from './avatar';

export interface GenerationRequest {
  config: GenerationConfig;
  userId?: string;
}

export interface GenerationResponse {
  success: boolean;
  result?: GenerationResult;
  error?: string;
  jobId?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  generations: GenerationResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoryItem {
  id: string;
  thumbnail: string;
  config: GenerationConfig;
  createdAt: Date;
  favorite: boolean;
}


