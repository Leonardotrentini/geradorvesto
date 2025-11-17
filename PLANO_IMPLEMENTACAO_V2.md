# 📋 PLANO DE IMPLEMENTAÇÃO V2

## 🎯 OBJETIVO

Reestruturar sistema completo seguindo briefing técnico:
- Módulo 1: Scan da peça (garment digital)
- Módulo 2: Try-on em modelo (melhorar)
- Módulo 3: Try-on em manequim (reescrever com templates)

---

## 📅 FASES DE IMPLEMENTAÇÃO

### **FASE 1: ESTRUTURA BASE** (Prioridade Alta)

#### 1.1. Criar estrutura de módulos
- [ ] Criar `lib/modules/` com 3 módulos
- [ ] Criar interfaces TypeScript para cada módulo
- [ ] Criar sistema de IDs (garment_id, template_id, job_id)

#### 1.2. Biblioteca de Templates de Manequim
- [ ] Criar pasta `public/mannequins/` com templates
- [ ] Adicionar 3-5 templates (mulher frente/lado, homem frente/lado)
- [ ] Criar `lib/modules/mannequin-tryon/templates.ts`
- [ ] Pré-calcular máscaras dos templates

**Tempo estimado:** 2-3 horas

---

### **FASE 2: MÓDULO 1 - SCAN DA PEÇA** (Prioridade Alta)

#### 2.1. Validação Avançada
- [ ] Melhorar validação existente
- [ ] Adicionar checagem de foco (blur)
- [ ] Adicionar checagem de peça inteira

#### 2.2. Segmentação da Roupa
- [ ] Integrar Omnious para segmentação
- [ ] Ou usar Stability para background removal
- [ ] Gerar máscara da peça
- [ ] Refinar máscara

#### 2.3. Normalização
- [ ] Redimensionar para 1024×1024
- [ ] Centralizar peça
- [ ] Ajustar contraste/exposição
- [ ] Salvar PNG com fundo transparente

#### 2.4. Classificação (Opcional)
- [ ] Classificar tipo (vestido, blusa, etc.)
- [ ] Detectar cor principal
- [ ] Detectar padrão (liso, estampado)

#### 2.5. Armazenamento
- [ ] Criar sistema de armazenamento (Vercel Blob ou DB)
- [ ] Salvar garment_id com metadados
- [ ] Retornar garment_id para uso nos módulos 2 e 3

**Tempo estimado:** 4-6 horas

---

### **FASE 3: MÓDULO 2 - TRY-ON MODELO** (Prioridade Média)

#### 3.1. Melhorar Pré-processamento
- [ ] Redimensionar modelo para 2:3 (1024×1536)
- [ ] Segmentar pessoa (human parsing) - opcional
- [ ] Calcular pose (keypoints) - opcional

#### 3.2. Warping com Vella
- [ ] Usar garment_id do Módulo 1
- [ ] Passar garment recortado para Vella
- [ ] Obter roupa warpada

#### 3.3. Geração com Stability
- [ ] Usar Stability image-to-image + inpainting
- [ ] Base: foto da modelo
- [ ] Mask: região da roupa
- [ ] Overlay: garment warpado
- [ ] Prompt otimizado

#### 3.4. Pós-processamento
- [ ] Upscale com Stability
- [ ] Correção de cor
- [ ] Exportar 2:3, 1500px altura

**Tempo estimado:** 3-4 horas

---

### **FASE 4: MÓDULO 3 - TRY-ON MANEQUIM** (Prioridade Alta)

#### 4.1. Sistema de Templates
- [ ] Criar `lib/modules/mannequin-tryon/templates.ts`
- [ ] Carregar templates do `public/mannequins/`
- [ ] Selecionar template por gênero/pose

#### 4.2. Segmentação Pré-calculada
- [ ] Gerar máscara do manequim (uma vez)
- [ ] Gerar máscara da área da roupa
- [ ] Salvar máscaras para reutilização

#### 4.3. Warping da Roupa
- [ ] Usar garment_id do Módulo 1
- [ ] Usar template do Módulo 3
- [ ] Warping com Vella (mesmo processo do modelo)

#### 4.4. Geração com Stability
- [ ] Base: manequim template
- [ ] Mask: área da roupa
- [ ] Hint: garment warpado
- [ ] Prompt específico de manequim

#### 4.5. Pós-processamento
- [ ] Upscale se necessário
- [ ] Checagem: roupa não "vazou"
- [ ] Exportar proporção correta

**Tempo estimado:** 4-5 horas

---

### **FASE 5: INTERFACE E INTEGRAÇÃO** (Prioridade Média)

#### 5.1. Atualizar Fluxo do Usuário
- [ ] Passo 1: Upload → Scan da peça
- [ ] Passo 2: Escolher modelo/manequim/ambos
- [ ] Passo 3: Exibir resultados

#### 5.2. Melhorar UI
- [ ] Preview da peça com nota de qualidade
- [ ] Alertas de validação
- [ ] Seleção de modelo/manequim
- [ ] Exibição de resultados

**Tempo estimado:** 2-3 horas

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. **Fase 1** - Estrutura base + Templates (crítico para manequim)
2. **Fase 4** - Módulo 3 (reescrever manequim com templates)
3. **Fase 2** - Módulo 1 (scan da peça)
4. **Fase 3** - Módulo 2 (melhorar modelo)
5. **Fase 5** - Interface e integração

**Total estimado:** 15-21 horas

---

## 📝 NOTAS IMPORTANTES

### Templates de Manequim:
- **NÃO gerar do zero** - sempre usar templates fixos
- Templates devem ser idênticos à imagem 2 (fundo preto, premium)
- Pré-calcular máscaras uma vez, reutilizar sempre

### Warping:
- Vella/Omnious: usar como warping engine
- Stability: usar como pintor final (image-to-image + inpainting)

### IDs:
- Tudo deve ter ID para rastreabilidade
- garment_id, mannequin_template_id, tryon_job_id

---

**Status:** Plano definido - Pronto para começar implementação

