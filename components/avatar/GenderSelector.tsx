'use client'

import { Gender } from '@/types/avatar'
import { Button } from '@/components/ui/button'
import { User, Users } from 'lucide-react'

interface GenderSelectorProps {
  value: Gender
  onChange: (gender: Gender) => void
}

export function GenderSelector({ value, onChange }: GenderSelectorProps) {
  const options: { value: Gender; label: string; icon: React.ReactNode }[] = [
    { value: 'homem', label: 'Homem', icon: <User className="w-5 h-5" /> },
    { value: 'mulher', label: 'Mulher', icon: <User className="w-5 h-5" /> },
    { value: 'nao-binario', label: 'Não-binário', icon: <Users className="w-5 h-5" /> },
  ]

  return (
    <div>
      <label className="block text-sm font-medium mb-3 text-gold">Gênero</label>
      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? 'default' : 'outline'}
            className={`h-auto py-4 flex flex-col items-center gap-2`}
            onClick={() => onChange(option.value)}
          >
            {option.icon}
            <span>{option.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}


