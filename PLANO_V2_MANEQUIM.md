# 🚀 PLANO V2 - RESOLVER MANEQUIM

## 🎯 OBJETIVO

Resolver a geração de manequim que está falhando completamente (gerando collage de modelo real em vez de manequim branco minimalista).

---

## 📊 ANÁLISE DO PROBLEMA

### O que está acontecendo:
- Modelo text-to-image (Stable Diffusion/SDXL) não entende "manequim"
- Gera imagens de modelos reais em vez de manequins
- Prompts profissionais não resolvem o problema fundamental
- Modelo não tem dataset específico de manequins

### Por que não funciona:
1. **Falta de dataset:** Modelo não foi treinado com manequins
2. **Abstração:** Text-to-image não consegue abstrair "manequim branco sem rosto"
3. **Pipeline genérica:** Usando mesma pipeline do avatar (não adequada)

---

## 🔍 OPÇÕES DE SOLUÇÃO

### **OPÇÃO 1: Modelo Específico de Manequim** ⭐ RECOMENDADO

**Buscar modelo no Replicate treinado para manequins:**
- Pesquisar modelos como "mannequin", "fashion mannequin", "product photography"
- Usar modelo com ControlNet para pose fixa
- Ou modelo fine-tuned para manequins

**Vantagens:**
- ✅ Mais rápido de implementar
- ✅ Resultado mais previsível
- ✅ Menos desenvolvimento

**Desvantagens:**
- ⚠️ Pode não existir modelo específico
- ⚠️ Pode ter custo adicional

**Implementação:**
```typescript
// Buscar modelo específico
const MANNEQUIN_MODEL = 'pesquisar-no-replicate'
// Ou usar ControlNet com pose de manequim
```

---

### **OPÇÃO 2: Pipeline de Dois Passos** 🔧

**Passo 1: Gerar manequim base (sem roupa)**
```typescript
const mannequinBase = await generateMannequinBase({
  type: 'fiberglass-slim',
  pose: 'standard-vitrine',
  material: 'white-glossy'
})
```

**Passo 2: Aplicar roupa via inpainting**
```typescript
const final = await applyGarmentToMannequin({
  mannequin: mannequinBase,
  garment: productImageUrl,
  mask: 'torso-bust-waist'
})
```

**Vantagens:**
- ✅ Controle total
- ✅ Resultado previsível
- ✅ Pode usar manequim base fixo

**Desvantagens:**
- ❌ Mais complexo
- ❌ Requer bibliotecas adicionais
- ❌ Mais custo (2 gerações)

**Bibliotecas necessárias:**
- Inpainting model (Replicate)
- Ou ControlNet para inpainting

---

### **OPÇÃO 3: Usar Imagem de Referência** 📸

**Usar imagem de manequim real como base:**
- Biblioteca de manequins base (fiberglass, branco, sem roupa)
- Aplicar roupa via inpainting/warping
- Resultado sempre consistente

**Vantagens:**
- ✅ Resultado previsível
- ✅ Sempre mesmo estilo
- ✅ Mais rápido (só inpainting)

**Desvantagens:**
- ❌ Requer biblioteca de imagens base
- ❌ Menos flexível
- ❌ Precisa manter imagens base

**Implementação:**
```typescript
// Selecionar manequim base (por gênero)
const baseMannequin = getBaseMannequin(gender)

// Aplicar roupa via inpainting
const final = await inpaintGarment({
  image: baseMannequin,
  garment: productImageUrl,
  mask: 'torso-area'
})
```

---

### **OPÇÃO 4: Remover Temporariamente** ⏸️

**Remover geração de manequim:**
- Focar apenas no avatar (que funciona)
- Adicionar manequim depois quando tiver solução
- App fica funcional imediatamente

**Vantagens:**
- ✅ App funcional agora
- ✅ Foco em melhorar avatar
- ✅ Adicionar manequim depois

**Desvantagens:**
- ❌ Funcionalidade incompleta
- ❌ Cliente pode esperar manequim

---

## 🎯 RECOMENDAÇÃO

### **Fase 1 (Imediato):**
1. **Remover manequim temporariamente** (Opção 4)
2. **Focar em melhorar avatar** (já funciona bem)
3. **Adicionar opção "Gerar apenas avatar"**

### **Fase 2 (Curto prazo - 1-2 semanas):**
1. **Pesquisar modelo específico** (Opção 1)
2. **Testar modelos no Replicate**
3. **Implementar se encontrar solução viável**

### **Fase 3 (Médio prazo - 1 mês):**
1. **Implementar pipeline de dois passos** (Opção 2)
2. **Ou usar imagem de referência** (Opção 3)
3. **Depende do que funcionar melhor**

---

## 📋 CHECKLIST V2

### Decisões:
- [ ] Qual opção seguir?
- [ ] Remover manequim temporariamente?
- [ ] Manter tentativa de gerar manequim?

### Implementação:
- [ ] Remover código de manequim (se Opção 4)
- [ ] Pesquisar modelos no Replicate (se Opção 1)
- [ ] Implementar pipeline dois passos (se Opção 2)
- [ ] Criar biblioteca de manequins base (se Opção 3)

### Testes:
- [ ] Testar nova solução
- [ ] Validar qualidade
- [ ] Verificar custos

---

## 💡 PRÓXIMOS PASSOS

1. **Decidir estratégia** (Opção 1, 2, 3 ou 4)
2. **Implementar solução escolhida**
3. **Testar e validar**
4. **Documentar resultado**

---

**Status:** Aguardando decisão sobre estratégia V2

