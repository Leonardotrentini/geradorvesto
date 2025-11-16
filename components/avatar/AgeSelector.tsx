'use client'

import { Slider } from '@/components/ui/slider'
import { useEffect, useState } from 'react'

interface AgeSelectorProps {
  value: number
  onChange: (age: number) => void
}

export function AgeSelector({ value, onChange }: AgeSelectorProps) {
  const [age, setAge] = useState(value || 30)

  // Sincroniza com o valor externo
  useEffect(() => {
    setAge(value || 30)
  }, [value])

  const handleChange = (newValue: number[]) => {
    const newAge = newValue[0]
    setAge(newAge)
    onChange(newAge)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-medium text-gold">Idade</label>
        <span className="text-lg font-semibold text-gold-bright">{age} anos</span>
      </div>
      <Slider
        min={18}
        max={70}
        step={1}
        value={[age]}
        onValueChange={handleChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gold/50 mt-1 font-light">
        <span>18</span>
        <span>70</span>
      </div>
    </div>
  )
}


