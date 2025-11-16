'use client'

import { Scenario, ScenarioType } from '@/types/avatar'
import { Button } from '@/components/ui/button'
import { User, MapPin, Image as ImageIcon } from 'lucide-react'

interface ScenarioSelectorProps {
  scenario: Scenario
  scenarioType?: ScenarioType
  onScenarioChange: (scenario: Scenario) => void
  onScenarioTypeChange?: (type: ScenarioType) => void
}

export function ScenarioSelector({
  scenario,
  scenarioType,
  onScenarioChange,
  onScenarioTypeChange,
}: ScenarioSelectorProps) {
  const scenarios: { value: Scenario; label: string; icon: React.ReactNode }[] = [
    { value: 'avatar', label: 'Avatar', icon: <User className="w-5 h-5" /> },
    { value: 'rua', label: 'Rua', icon: <MapPin className="w-5 h-5" /> },
    { value: 'cenario', label: 'Cenário', icon: <ImageIcon className="w-5 h-5" /> },
  ]

  const scenarioTypes: { value: ScenarioType; label: string }[] = [
    { value: 'estudio', label: 'Estúdio' },
    { value: 'praia', label: 'Praia' },
    { value: 'parque', label: 'Parque' },
    { value: 'loja', label: 'Loja' },
    { value: 'evento', label: 'Evento' },
    { value: 'urbano', label: 'Urbano' },
  ]

  return (
    <div>
      <label className="block text-sm font-medium mb-3 text-gold">Cenário</label>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {scenarios.map((sc) => (
          <Button
            key={sc.value}
            variant={scenario === sc.value ? 'default' : 'outline'}
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => onScenarioChange(sc.value)}
          >
            {sc.icon}
            <span>{sc.label}</span>
          </Button>
        ))}
      </div>

      {scenario === 'cenario' && onScenarioTypeChange && (
        <div>
          <label className="block text-sm font-medium mb-2 text-gold">Tipo de Cenário</label>
          <div className="grid grid-cols-3 gap-2">
            {scenarioTypes.map((type) => (
              <Button
                key={type.value}
                variant={scenarioType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onScenarioTypeChange(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


