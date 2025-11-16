# 📊 RELATÓRIO DE DIAGNÓSTICO COMPLETO - VESTO co. Gerador de Fotos

**Data:** $(date)  
**Status:** 🔴 CRÍTICO - Problemas identificados e soluções propostas

---

## 🎯 PROBLEMAS IDENTIFICADOS

### 1. ❌ AVATAR: Imagem retornada igual à original (não faz try-on)
**Sintoma:** O avatar gerado é idêntico à foto da pessoa enviada, sem aplicar a roupa.

**Possíveis Causas:**
- ✅ **Parâmetros incorretos do Vella 1.5**: O modelo pode precisar de parâmetros adicionais
- ✅ **Imagem da roupa não isolada**: Vella funciona melhor com roupas em fundo branco/neutro
- ✅ **Ordem dos parâmetros**: Pode estar invertido (garment vs person)
- ✅ **Modelo retornando imagem original**: O modelo pode estar retornando a imagem da pessoa sem processar

### 2. ❌ MANEQUIM: Não está sendo gerado
**Sintoma:** A geração do manequim falha silenciosamente, retornando null.

**Possíveis Causas:**
- ✅ **SDXL falhando**: O modelo SDXL pode estar retornando erro
- ✅ **Erro não capturado**: O erro pode estar sendo engolido sem log
- ✅ **Prompt inadequado**: O prompt pode não estar gerando o resultado esperado
- ✅ **Timeout**: A geração pode estar demorando demais e dando timeout

---

## 🔍 ANÁLISE TÉCNICA DETALHADA

### Problema 1: Vella Try-On não está funcionando

**Código Atual:**
```typescript
const input: any = {
  top_image: request.garmentImage,  // Imagem da roupa
  model_image: request.personImage,  // Imagem da pessoa
}
```

**Problemas Identificados:**
1. **Falta de parâmetros opcionais**: Vella aceita parâmetros adicionais que podem melhorar o resultado:
   - `category`: Tipo de roupa (top, dress, bottom, etc.)
   - `garment_mask`: Máscara da roupa (opcional, mas melhora resultados)
   - `seed`: Para reprodutibilidade

2. **Não está validando formato das imagens**: Vella funciona melhor com:
   - Roupa isolada (fundo branco/transparente)
   - Pessoa de corpo inteiro, boa iluminação

3. **Não está tratando erros específicos do Vella**: Se o modelo retornar erro, não sabemos qual foi

### Problema 2: Manequim não está sendo gerado

**Código Atual:**
```typescript
try {
  const output = await replicate.run(SDXL_MODEL, { input: {...} })
  // Processa output
} catch (error) {
  // Tenta fallback
  try {
    const output = await replicate.run(BASIC_MODEL, { input: {...} })
  } catch (fallbackError) {
    throw new Error(`Erro ao gerar manequim: ${fallbackError.message}`)
  }
}
```

**Problemas Identificados:**
1. **Erro sendo engolido**: Se ambos os modelos falharem, o erro é lançado mas pode não estar sendo logado corretamente
2. **Prompt pode não estar adequado**: O prompt pode não estar gerando um manequim realista
3. **Dimensões podem estar erradas**: 512x768 pode ser muito pequeno para SDXL

---

## ✅ SOLUÇÕES PROPOSTAS

### Solução 1: Corrigir Vella Try-On

**Ações:**
1. ✅ Adicionar parâmetros opcionais do Vella
2. ✅ Melhorar validação de imagens (adicionar avisos ao usuário)
3. ✅ Adicionar logs detalhados para debug
4. ✅ Adicionar tratamento de erros específicos
5. ✅ Verificar se a imagem retornada é realmente diferente da original

**Código Proposto:**
```typescript
const input: any = {
  top_image: request.garmentImage,
  model_image: request.personImage,
  // Parâmetros opcionais que melhoram resultados
  category: 'top', // ou 'dress', 'bottom', etc.
  // seed: opcional para reprodutibilidade
}
```

### Solução 2: Corrigir Geração do Manequim

**Ações:**
1. ✅ Melhorar tratamento de erros com logs detalhados
2. ✅ Ajustar prompt para ser mais específico
3. ✅ Aumentar dimensões (768x1024 para melhor qualidade)
4. ✅ Adicionar timeout explícito
5. ✅ Implementar retry com backoff

**Código Proposto:**
```typescript
// Prompt mais específico
const prompt = `professional fashion photography, ${genderText} store mannequin, realistic human-like proportions, elegant pose, wearing ${garmentDescription}, ${backgroundStyle}, high-end retail display, studio lighting, 8k resolution, photorealistic`

// Dimensões maiores
width: 768,
height: 1024,
```

### Solução 3: Adicionar Validação e Feedback ao Usuário

**Ações:**
1. ✅ Validar se a imagem da roupa está isolada (fundo branco)
2. ✅ Validar se a imagem da pessoa é de corpo inteiro
3. ✅ Adicionar avisos visuais antes de gerar
4. ✅ Mostrar preview das imagens antes de enviar

---

## 🚀 PLANO DE AÇÃO IMEDIATO

### Fase 1: Correções Críticas (AGORA)
1. ✅ Corrigir parâmetros do Vella 1.5
2. ✅ Adicionar logs detalhados em TODAS as etapas
3. ✅ Melhorar tratamento de erros do manequim
4. ✅ Ajustar prompt e dimensões do manequim

### Fase 2: Melhorias (DEPOIS)
1. ✅ Adicionar validação de imagens
2. ✅ Adicionar preview antes de gerar
3. ✅ Implementar retry automático
4. ✅ Adicionar métricas de qualidade

### Fase 3: Otimizações (FUTURO)
1. ✅ Cache de resultados
2. ✅ Processamento em background
3. ✅ Notificações quando pronto

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Corrigir `lib/api/replicate-tryon.ts` com parâmetros corretos
- [ ] Adicionar logs detalhados em `app/api/generate/route.ts`
- [ ] Corrigir `lib/api/mannequin.ts` com prompt melhorado
- [ ] Testar localmente antes de fazer deploy
- [ ] Verificar logs na Vercel após deploy
- [ ] Testar com imagens reais
- [ ] Documentar requisitos de imagens para usuários

---

## 🔗 REFERÊNCIAS

- **Vella 1.5 Docs**: https://replicate.com/omnious/vella-1.5
- **SDXL Docs**: https://replicate.com/stability-ai/sdxl
- **Replicate API**: https://replicate.com/docs

---

## 💡 OBSERVAÇÕES IMPORTANTES

1. **Vella requer imagens de qualidade**: Roupa isolada + pessoa de corpo inteiro
2. **Custo por geração**: ~$0.03 (avatar) + ~$0.02 (manequim) = ~$0.05 total
3. **Tempo de geração**: 30s-2min por variação
4. **Rate limits**: Replicate tem limites de requisições simultâneas

---

**Próximo Passo:** Implementar as correções da Fase 1 imediatamente.

