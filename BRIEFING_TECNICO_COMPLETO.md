# 📋 BRIEFING TÉCNICO COMPLETO - Virtual Try-On Profissional

## 🎯 OBJETIVO DO SISTEMA

Desenvolver um sistema de virtual try-on 2D que receba:
1. Imagem da peça de roupa
2. Imagem de corpo inteiro da pessoa/modelo

E gere:
- **(a)** Avatar da pessoa vestindo a peça
- **(b)** Manequim de loja com a peça, em ambiente premium

**Qualidade:** E-commerce internacional, mantendo proporções reais, textura e iluminação coerente.

---

## 📥 PADRÕES DE ENTRADA (INPUT)

### 2.1. Foto da Pessoa/Modelo (Avatar)

#### Obrigatório:
- ✅ Corpo inteiro da cabeça aos pés
- ✅ Orientação vertical (2:3 ou 3:4)
- ✅ Resolução mínima: 1500px de altura (ideal 2048px+)
- ✅ Fundo neutro (branco, cinza claro ou bege)
- ✅ Iluminação uniforme, sem sombras fortes
- ✅ Pose neutra: em pé, braços levemente afastados, corpo voltado para frente
- ✅ Roupa base justa e neutra (body, legging, shorts justo, top justo)

#### Validações Automáticas:
- ❌ Rejeitar se: corpo cortado, mais de uma pessoa, fundo muito poluído, resolução muito baixa (< 800px altura)

### 2.2. Foto da Roupa

#### Obrigatório:
- ✅ Peça isolada (de preferência "ghost mannequin" ou pendurada)
- ✅ Fundo branco puro ou transparente
- ✅ Resolução mínima: 1024px no maior lado (ideal 2048px)
- ✅ Peça totalmente visível, sem cortes
- ✅ Boa iluminação, sem reflexos fortes

#### Validações Automáticas:
- ✅ Verificar: contraste entre peça e fundo, bordas bem definidas, ausência de objetos extras
- ✅ Classificar tipo de peça: vestido, blusa, saia, calça, macacão etc.

---

## 🔄 PIPELINE TÉCNICO COMPLETO

### Visão Macro:

```
1. Pré-processamento das imagens
2. Segmentação do corpo (human parsing)
3. Estimativa de pose (pose estimation)
4. Segmentação + normalização da roupa
5. Warping/deformação da roupa no corpo
6. Geração try-on (modelo difusional / Vella / Stability)
7. Inpainting e refinamento
8. Upscaling e pós-processamento
9. Checagem de qualidade e retorno ao usuário
```

### 3.1. Pré-processamento

#### Avatar:
- Redimensionar mantendo proporção para 1024 × 1536 (2:3)
- Normalizar brilho/contraste
- Aplicar leve desruído se necessário
- Centralizar a pessoa no quadro

#### Roupa:
- Redimensionar para 1024 × 1024
- Remover fundo (se ainda houver)
- Corrigir cor se estiver estourada ou muito escura

### 3.2. Segmentação do Corpo (Human Parsing)

**Objetivo:** Gerar máscaras precisas de:
- Corpo completo
- Regiões relevantes (tronco, braços, pernas)

**Uso:**
- Encaixar a roupa
- Preservar partes expostas do corpo
- Controlar onde o modelo pode pintar por cima

**Requisitos:**
- Máscara em alta resolução
- Bordas suaves (anti-aliasing)
- Salvar como mapa binário ou multi-classes

### 3.3. Estimativa de Pose (Pose Estimation)

**Objetivo:** Extrair pontos-chave (keypoints) do corpo:
- Ombros, cotovelos, pulsos
- Quadril, joelhos, tornozelos
- Pescoço, topo da cabeça

**Uso:**
- Guia geométrica para deformar a roupa (warping)
- Ajustar comprimento e caimento
- Identificar se a pose é válida

### 3.4. Segmentação e Normalização da Roupa

**Passos:**
1. Gerar máscara precisa da peça (sem fundo)
2. Extrair: contorno, textura, "centro" da peça
3. Normalizar: escala, posição

**Objetivo:** Deixar a peça em formato padrão para depois sofrer warping.

### 3.5. Cloth Warping (Deformação da Roupa)

**ETAPA CRÍTICA**

Usar keypoints do corpo e bounding box do tronco/quadril para:
- Deformar a roupa
- Ajustar largura, altura, inclinação

A roupa deve seguir:
- Curva dos ombros
- Cintura
- Quadril
- Comprimento adequado

**Resultado:** Versão da roupa "esticada" exatamente na área do corpo onde será aplicada.

### 3.6. Geração Try-On (Modelo Difusional)

**Inputs:**
- Imagem do avatar com máscara de corpo
- Layer com roupa já warpada
- Máscara de região onde a roupa pode ser aplicada
- Prompt textual

**Modo ideal:** image-to-image + mask + prompt

**Objetivo:**
- Preservar identidade da pessoa (rosto, cabelo, corpo)
- Aplicar nova roupa mantendo: textura, cor, caimento, interação com luz

### 3.7. Inpainting e Refinamento

**Depois da primeira geração:**
1. Detectar artefatos: distorções em braços, mãos "fundidas", bordas estranhas
2. Aplicar inpainting apenas em regiões problemáticas
3. Refinar: sombras, dobras sutis, brilho coerente

### 3.8. Upscaling e Pós-processamento

- Aplicar upscaler (2x ou 4x)
- Correção final de cor
- Exportar em 1500px altura (mínimo)

### 3.9. Checagem de Qualidade (QC Automático)

**Regras de rejeição:**
- Rosto deformado ou com artefato evidente
- Mão desaparecida ou misturada com tecido
- Roupa claramente flutuando
- Fundo com ruídos deformados

**Se reprovar:** Tentar nova geração com seed diferente e variações de prompt.

---

## 🎨 TEMPLATES DE PROMPT

### 5.1. Prompt Base – Avatar Vestindo a Peça

```
"Full-body photo of the same woman, standing in a natural pose, 
wearing the uploaded [TYPE_OF_GARMENT] in [COLOR/DESCRIPTION]. 
Keep her face, hair, body and proportions exactly the same as the 
original photo. The clothing must follow the shape of her body 
realistically, with natural folds, correct gravity and soft shadows. 
Studio lighting, clean white background, high-resolution fashion 
e-commerce photo, extremely realistic, 4k, sharp details, 
no distortions, no extra limbs."
```

### 5.2. Negative Prompt

```
"no extra arms, no extra legs, no deformed hands, no distorted face, 
no glitch, no blurry details, no double clothing, no duplicate body parts, 
no text, no logos, no watermark, no unrealistic proportions, 
no cartoon style, no exaggerated makeup, no strange artifacts on clothes or skin."
```

### 5.3. Prompt – Manequim em Loja

```
"High-end fashion boutique interior, luxurious mannequins and clothes. 
Show a single mannequin wearing the uploaded [TYPE_OF_GARMENT] in 
[COLOR/DESCRIPTION], lit by elegant warm store lighting, surrounded by 
premium dresses and accessories, golden details, glass shelves, 
modern fashion retail design, ultra realistic, 4k, sharp details."
```

---

## 📊 MÉTRICAS DE AVALIAÇÃO

- Taxa de aceitação visual interna
- Taxa de sucesso por foto enviada
- NPS dos lojistas/usuários
- Tempo médio de geração (< 20-30s por look)
- Consistência de cor da peça (DeltaE)

---

## ✅ REGRAS DE QUALIDADE DA IMAGEM FINAL

A imagem é considerada "boa" quando:

1. **Identidade preservada:** rosto reconhecível, proporção mantida
2. **Roupa coerente:** adapta-se ao corpo, sem cortes estranhos, textura visível
3. **Iluminação consistente:** luz da roupa = luz do avatar, sombras coerentes
4. **Ausência de artefatos graves:** nada "derretido", sem múltiplos membros

