# 📦 MÓDULO 1: SCAN DA PEÇA (GARMENT DIGITAL)

## 🎯 OBJETIVO

Pipeline completa de escaneamento de roupa que transforma uma foto simples em um "garment asset" digital padronizado e reutilizável.

---

## 🔧 PIPELINE COMPLETA

### ETAPA 1: Validação Avançada
- ✅ Resolução (ideal ≥ 1024px)
- ✅ Foco (detecção de blur)
- ✅ Peça inteira (detecção de cortes)
- ✅ Fundo (análise de qualidade)
- ✅ Contraste (roupa vs fundo)

### ETAPA 2: Segmentação Precisa
- ✅ Tentar Omnious (especializado em fashion)
- ✅ Fallback para Stability (background removal)
- ✅ Refinamento de máscara
- ✅ Geração de PNG transparente

### ETAPA 3: Normalização
- ✅ Redimensionar para canvas padrão (1024×1024)
- ✅ Centralizar peça
- ✅ Ajustar contraste/exposição
- ✅ Gerar máscara normalizada

### ETAPA 4: Classificação
- ✅ Tipo (vestido, blusa, shorts, calça, etc.)
- ✅ Cor principal
- ✅ Padrão (liso, estampado, listrado)

### ETAPA 5: Armazenamento
- ✅ Gerar garment_id único
- ✅ Salvar imagem normalizada
- ✅ Salvar máscara
- ✅ Salvar metadados

---

## 📋 ARQUIVOS

- `scanner.ts` - Pipeline principal
- `validation.ts` - Validação avançada
- `segmentation.ts` - Segmentação precisa
- `normalization.ts` - Normalização e padronização
- `classification.ts` - Classificação (tipo, cor, padrão)
- `storage.ts` - Armazenamento
- `types.ts` - Tipos TypeScript

---

## ⚠️ NOTA IMPORTANTE

**O código atual usa APIs do browser (Image, canvas, document).**
**Precisa ser adaptado para Node.js usando:**
- `sharp` para processamento de imagens
- `jimp` ou `canvas` (node-canvas) para manipulação
- Ou APIs serverless que processam imagens

**Próximo passo:** Adaptar código para funcionar no backend.

---

## 🚀 USO

```typescript
import { scanGarment } from '@/lib/modules/garment-scanner/scanner'

const result = await scanGarment({
  image: file // File ou URL
})

// Retorna:
// {
//   garment_id: string
//   garment_image: string (URL)
//   garment_mask: string (URL)
//   metadata: { type, color, pattern, dimensions, quality_score }
//   created_at: Date
// }
```

---

**Status:** Estrutura completa criada - Precisa adaptar para Node.js

