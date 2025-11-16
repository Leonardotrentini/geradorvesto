'use client'

import { BodyShape } from '@/types/avatar'
import { Button } from '@/components/ui/button'

interface ShapeSelectorProps {
  value: BodyShape
  onChange: (shape: BodyShape) => void
}

export function ShapeSelector({ value, onChange }: ShapeSelectorProps) {
  const shapes: { value: BodyShape; label: string }[] = [
    { value: 'magro', label: 'Magro' },
    { value: 'atletico', label: 'Atlético' },
    { value: 'medio', label: 'Médio' },
    { value: 'robusto', label: 'Robusto' },
    { value: 'plus-size', label: 'Plus Size' },
  ]

  return (
    <div>
      <label className="block text-sm font-medium mb-3 text-gold">Tipo de Corpo</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {shapes.map((shape) => (
          <Button
            key={shape.value}
            variant={value === shape.value ? 'default' : 'outline'}
            onClick={() => onChange(shape.value)}
          >
            {shape.label}
          </Button>
        ))}
      </div>
    </div>
  )
}


