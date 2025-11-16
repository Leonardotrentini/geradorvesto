'use client'

import { Loader2 } from 'lucide-react'

interface ProgressBarProps {
  progress: number
  status?: string
}

export function ProgressBar({ progress, status }: ProgressBarProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gold/70 font-light">{status || 'Processando...'}</span>
        <span className="text-gold-bright font-semibold">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-[#1a4d3a] border border-gold/20 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gold-gradient rounded-full transition-all duration-300 flex items-center justify-center shadow-lg"
          style={{ width: `${progress}%` }}
        >
          {progress < 100 && (
            <Loader2 className="w-3 h-3 text-[#1a4d3a] animate-spin" />
          )}
        </div>
      </div>
    </div>
  )
}


