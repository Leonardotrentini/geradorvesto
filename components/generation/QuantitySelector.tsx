'use client'

import { Button } from '@/components/ui/button'

interface QuantitySelectorProps {
  value: number
  onChange: (quantity: number) => void
}

export function QuantitySelector({ value, onChange }: QuantitySelectorProps) {
  const quantities = [1, 2, 3, 4]

  return (
    <div>
      <label className="block text-sm font-medium text-gold mb-3">
        Quantidade de Variações
      </label>
      <div className="flex gap-2">
        {quantities.map((qty) => (
          <Button
            key={qty}
            type="button"
            variant={value === qty ? 'default' : 'outline'}
            onClick={() => onChange(qty)}
            className={`flex-1 ${
              value === qty
                ? 'bg-gold-gradient text-vesto-green font-semibold'
                : 'border-gold/30 text-gold hover:border-gold/50'
            }`}
          >
            {qty}
          </Button>
        ))}
      </div>
      <p className="text-xs text-gold/50 mt-2 font-light">
        {value === 1
          ? 'Gera 1 imagem'
          : value === 4
          ? 'Gera 4 variações com estilos diferentes'
          : `Gera ${value} variações`}
      </p>
    </div>
  )
}

