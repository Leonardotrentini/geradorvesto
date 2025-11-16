# 🎯 Guia Passo a Passo: Encontrar Modelo de Try-On no Replicate

## ✅ Você já tem:
- ✅ Conta no Replicate
- ✅ Token configurado (no .env.local)
- ✅ Créditos adicionados
- ✅ Código pronto para usar

## 🔍 Agora vamos encontrar o modelo:

### **PASSO 1: Explorar Modelos**

1. **No Replicate, clique em "Explore"** (no topo da página)
   - Ou acesse diretamente: https://replicate.com/explore

2. **Na barra de pesquisa, digite:**
   ```
   try-on
   ```
   - Pressione Enter

3. **Você verá uma lista de modelos**
   - Procure por modelos relacionados a "virtual try-on", "outfit", "garment"

### **PASSO 2: Modelos Recomendados para Testar**

#### **Opção 1: Vella (Mais Popular)**
- **Nome:** `omnious/vella`
- **Link direto:** https://replicate.com/omnious/vella
- **Precisa de:** 2 imagens (roupa + pessoa)
- **Custo:** ~US$ 0.01-0.05 por geração

#### **Opção 2: IDM-VTON**
- **Pesquise:** "idm-vton"
- **Precisa de:** 2 imagens (roupa + pessoa)

#### **Opção 3: Outros**
- Pesquise: "outfit" ou "garment transfer"
- Veja quais aparecem e leia a descrição

### **PASSO 3: Escolher um Modelo**

1. **Clique no modelo** que você quer usar
2. **Leia a página do modelo:**
   - Veja os exemplos de uso
   - Leia os parâmetros necessários
   - Veja o custo por geração

3. **Copie o nome do modelo:**
   - Exemplo: `omnious/vella`
   - Está no topo da página, tipo: `owner/model`

4. **Copie o ID da versão (se necessário):**
   - Procure por "Version" ou "Latest version"
   - Copie o ID completo (ex: `abc123def456...`)
   - Se não encontrar, use `latest`

### **PASSO 4: Me Enviar as Informações**

Depois de escolher, me envie:

1. **Nome do modelo:** (ex: `omnious/vella`)
2. **ID da versão:** (se tiver, ou diga "latest")
3. **Quais parâmetros ele precisa:**
   - Precisa de 2 imagens? (roupa + pessoa)
   - Ou gera avatar automaticamente?

### **PASSO 5: Eu Atualizo o Código**

Assim que você me enviar:
- ✅ Atualizo `lib/api/replicate-tryon.ts` com o modelo correto
- ✅ Ajusto os parâmetros se necessário
- ✅ Testo se está tudo funcionando

## 🎨 Exemplo Visual:

```
Replicate.com
├── Explore (clique aqui)
│   └── Barra de pesquisa: "try-on"
│       ├── omnious/vella ← Clique aqui
│       ├── idm-vton
│       └── outros...
│
└── Página do Modelo
    ├── Nome: omnious/vella ← Copie isso
    ├── Version: abc123... ← Copie isso (ou use "latest")
    └── Inputs necessários:
        ├── garment_image (imagem da roupa)
        └── model_image (imagem da pessoa)
```

## ⚠️ IMPORTANTE:

### **Modelos que precisam de 2 imagens:**
- Vella, IDM-VTON, etc.
- **Solução:** Precisamos adicionar upload de imagem de pessoa no frontend

### **Modelos que geram avatar automaticamente:**
- Mais raros, mas existem
- **Vantagem:** Não precisa de imagem de pessoa

## 🚀 Depois que você me enviar:

1. Eu atualizo o código
2. Você testa
3. Se funcionar, está pronto! 🎉

## 💡 Dica Rápida:

**Se você quiser testar rápido:**
1. Escolha **Vella** (`omnious/vella`)
2. Me diga: "use Vella"
3. Eu atualizo o código
4. Depois adicionamos upload de imagem de pessoa se necessário

---

**Pronto para começar?** Encontre um modelo e me envie as informações! 🎯

