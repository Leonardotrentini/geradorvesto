import { create } from 'zustand';
import { GenerationConfig, GenerationResult } from '@/types/avatar';

interface GenerationState {
  currentConfig: GenerationConfig | null;
  currentResult: GenerationResult | null;
  isGenerating: boolean;
  progress: number;
  setConfig: (config: GenerationConfig) => void;
  setResult: (result: GenerationResult) => void;
  setGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  currentConfig: null,
  currentResult: null,
  isGenerating: false,
  progress: 0,
  setConfig: (config) => set({ currentConfig: config }),
  setResult: (result) => set({ currentResult: result }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress) => set({ progress }),
  reset: () => set({
    currentConfig: null,
    currentResult: null,
    isGenerating: false,
    progress: 0,
  }),
}));


