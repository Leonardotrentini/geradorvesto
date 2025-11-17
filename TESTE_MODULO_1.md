# 🧪 COMO TESTAR O MÓDULO 1 - SCAN DA PEÇA

## ✅ CÓDIGO ADAPTADO PARA NODE.JS

### Mudanças Realizadas:
- ✅ Substituído `Image`, `canvas`, `document` por `sharp`
- ✅ Todas as funções agora funcionam no backend Node.js
- ✅ Processamento de imagens usando Buffer
- ✅ Upload para Vercel Blob Storage

---

## 🚀 COMO TESTAR

### 1. **Via API Route** (Recomendado)

**Endpoint:** `POST /api/scan`

**Request:**
```bash
curl -X POST http://localhost:3000/api/scan \
  -F "image=@/caminho/para/imagem.jpg"
```

**Response:**
```json
{
  "success": true,
  "result": {
    "garment_id": "garment_1234567890_abc123",
    "garment_image": "https://...",
    "garment_mask": "https://...",
    "metadata": {
      "type": "dress",
      "color": "red",
      "pattern": "solid",
      "dimensions": { "width": 1024, "height": 1024 },
      "quality_score": 8
    },
    "created_at": "2024-..."
  }
}
```

### 2. **Via Código TypeScript**

```typescript
import { scanGarment } from '@/lib/modules/garment-scanner/scanner'

// Com File
const file = // ... seu File
const result = await scanGarment({ image: file })

// Com URL
const url = 'https://...'
const result = await scanGarment({ image: url })
```

---

## 📋 PIPELINE COMPLETA

### ETAPA 1: Validação ✅
- Resolução (≥ 1024px)
- Blur detection (Laplacian variance)
- Cut detection (análise de bordas)
- Background analysis
- Contrast calculation

### ETAPA 2: Segmentação ✅
- Tentar Omnious (fashion)
- Fallback Stability (background removal)
- Fallback básico

### ETAPA 3: Normalização ✅
- Redimensionar para 1024×1024
- Centralizar peça
- Ajustar contraste/exposição

### ETAPA 4: Classificação ✅
- Tipo (vestido, blusa, etc.)
- Cor dominante
- Padrão (liso, estampado)

### ETAPA 5: Armazenamento ✅
- Gerar garment_id
- Upload imagem normalizada
- Upload máscara
- Salvar metadados

---

## 🔧 DEPENDÊNCIAS

- ✅ `sharp` - Processamento de imagens
- ✅ `@vercel/blob` - Upload de imagens
- ✅ `replicate` - Segmentação (Omnious/Stability)

---

## ⚠️ NOTAS

1. **Segmentação:** Por enquanto usa `cjwbw/rembg` (genérico). Ideal: modelo Omnious específico para fashion.

2. **Classificação:** Usa heurísticas. Futuro: modelo de classificação de moda.

3. **Armazenamento:** Por enquanto só salva URLs. Futuro: banco de dados para metadados.

---

## 🎯 PRÓXIMOS PASSOS

1. **Testar API route** com imagem real
2. **Verificar resultados** de cada etapa
3. **Ajustar parâmetros** se necessário
4. **Integrar com Módulo 2 e 3**

---

**Status:** ✅ Código adaptado para Node.js - Pronto para testar!

