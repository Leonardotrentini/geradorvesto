# 🏗️ ARQUITETURA V2 - SISTEMA COMPLETO

## 🎯 VISÃO GERAL

### Objetivo:
A partir de **UMA foto simples da peça de roupa**, o sistema:
1. **Escaneia** a peça e cria um garment digital padronizado
2. **Usa esse garment** em:
   - Modelo humano (avatar)
   - Manequim de vitrine (fundo preto, premium)

### Restrições:
- ✅ Manter integrações: Stability, Vella-1.5
- ✅ Manter stack: Next.js, TypeScript, Replicate

---

## 📊 FLUXO DO USUÁRIO

### Passo 1: Upload da Peça
- Upload de foto da roupa (packshot, fundo claro)
- Preview + nota de qualidade (ex: 7/10)
- Alertas: "fundo ok / resolução baixa / peça cortada"
- **Ao clicar "Continuar"** → Dispara SCAN DA PEÇA (Módulo 1)

### Passo 2: Geração dos Resultados
- Usuário escolhe:
  - ✅ "Modelo humano"
  - ✅ "Manequim"
  - ✅ ou os dois
- Sistema usa garment_id do Módulo 1

### Passo 3: Resultado
- **Modelo humano:** formato 2:3, corpo inteiro, fundo branco/neutro
- **Manequim:** corpo inteiro, fundo preto, pose fixa premium
- Botões: Download, Copiar link, Compartilhar

---

## 🔧 PIPELINE TÉCNICO - 3 MÓDULOS

### **MÓDULO 1: SCAN DA PEÇA (GARMENT DIGITAL)**

#### 1.1. Validação da Imagem
- Resolução (ideal ≥ 1024px)
- Foco (sem blur pesado)
- Peça inteira (sem cortes)
- Fundo relativamente limpo

#### 1.2. Remoção de Fundo / Segmentação
- Usar: Omnious + Stability
- Gerar máscara da peça
- Refinar máscara com background removal
- **Saída:** PNG com fundo transparente + máscara alta resolução

#### 1.3. Normalização do Garment
- Redimensionar para canvas padrão (1024×1024)
- Centralizar peça
- Ajustar contraste/exposição
- Classificar com Omnious:
  - Tipo (vestido, blusa, shorts, calça...)
  - Cor principal
  - Padrão (liso, estampado)

#### 1.4. Salvar no Banco
```
garment_id → {
  garment_image: PNG recortado,
  garment_mask: máscara,
  tipo, cor, padrão,
  data_criacao
}
```

---

### **MÓDULO 2: TRY-ON EM MODELO (AVATAR HUMANO)**

#### 2.1. Pré-processamento da Modelo
- Redimensionar para 2:3 (ex: 1024×1536)
- Segmentar pessoa (human parsing)
- Calcular pose (keypoints)

#### 2.2. Warping da Roupa (Vella-1.5)
- Input: modelo + garment recortado + máscara
- Output: roupa deformada para caber no corpo

#### 2.3. Geração Final (Stability image-to-image)
- Modo image-to-image + inpainting
- Base: foto da modelo
- Mask: região da roupa
- Overlay: garment warpado
- Prompt: manter identidade, aplicar roupa natural

#### 2.4. Pós-processamento
- Upscale (Stability)
- Correção de cor
- Exportar 2:3, 1500px altura

---

### **MÓDULO 3: TRY-ON EM MANEQUIM**

#### 3.1. Biblioteca de Manequins (TEMPLATES FIXOS)
- **NÃO gerar manequim do zero**
- Usar templates prontos:
  - Mulher – frente
  - Mulher – de lado (como imagem 2)
  - Homem – frente
  - Homem – de lado
- Todos: alta resolução (2048px), fundo preto, luz estúdio

#### 3.2. Segmentação do Manequim (Pré-cálculo)
- Gerar máscara do manequim (uma vez, salvar)
- Gerar máscara da área da roupa

#### 3.3. Warping da Roupa (Vella-1.5)
- Input: manequim template + garment + máscara
- Output: garment warpado na forma do manequim

#### 3.4. Geração Final (Stability inpainting)
- Base: manequim original
- Mask: área da roupa
- Hint: garment warpado
- Prompt específico de manequim

#### 3.5. Pós-processamento
- Upscale se necessário
- Checagem: roupa não "vazou"
- Exportar proporção da imagem 2

---

## 🔄 CORREÇÕES NECESSÁRIAS

### 1. Separar 3 Módulos Claramente
- ❌ Hoje: Tudo misturado
- ✅ V2: 3 módulos independentes

### 2. Parar de Inventar Manequim
- ❌ Hoje: IA gera manequim do zero
- ✅ V2: Usar templates fixos sempre

### 3. Melhorar Pré-processamento
- ✅ Recorte perfeito da roupa
- ✅ Fundo neutro da modelo
- ✅ Biblioteca de manequins pré-segmentada

### 4. Usar Vella como Warping Engine
- ✅ Vella/Omnious: warping
- ✅ Stability: pintor final (image-to-image + inpainting)

### 5. Guardar Tudo com IDs
- ✅ garment_id
- ✅ mannequin_template_id
- ✅ tryon_job_id

---

## 📁 ESTRUTURA DE ARQUIVOS V2

```
lib/
  modules/
    garment-scanner/        # MÓDULO 1
      scanner.ts
      segmentation.ts
      normalization.ts
      classification.ts
    
    model-tryon/            # MÓDULO 2
      preprocessing.ts
      warping.ts
      generation.ts
      postprocessing.ts
    
    mannequin-tryon/        # MÓDULO 3
      templates.ts          # Biblioteca de templates
      segmentation.ts       # Pré-cálculo de máscaras
      warping.ts
      generation.ts
      postprocessing.ts
  
  api/
    replicate-tryon.ts      # Vella warping engine
    stability.ts            # Stability image-to-image/inpainting
    omnious.ts              # Omnious segmentação
  
  storage/
    garments.ts             # Armazenar garment_id
    templates.ts            # Armazenar mannequin_template_id
```

---

## 🎯 PRÓXIMOS PASSOS

1. **Criar estrutura de módulos**
2. **Implementar Módulo 1 (Scan da Peça)**
3. **Melhorar Módulo 2 (Try-on Modelo)**
4. **Reescrever Módulo 3 (Try-on Manequim)**
5. **Criar biblioteca de templates de manequim**

---

**Status:** Arquitetura definida - Pronto para implementação

