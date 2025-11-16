# 🔍 Guia: Encontrar Modelo de Try-On no Replicate

## O modelo que eu mencionei não existe! Vamos encontrar um que funcione:

### 📋 Passo a Passo:

#### 1. **Acesse o Replicate:**
   - Vá para: https://replicate.com
   - Faça login

#### 2. **Explore os Modelos:**
   - No topo da página, clique em **"Explore"**
   - Ou use a barra de pesquisa no topo

#### 3. **Pesquise por Try-On:**
   - Na barra de pesquisa, digite: **"try-on"** ou **"virtual try-on"**
   - Pressione Enter

#### 4. **Modelos Recomendados para Testar:**

   **a) Vella (Recomendado):**
   - Nome: `omnious/vella`
   - Link: https://replicate.com/omnious/vella
   - Precisa de: imagem da roupa + imagem de pessoa
   - Custo: ~US$ 0.01-0.05 por geração

   **b) IDM-VTON:**
   - Pesquise: "idm-vton"
   - Precisa de: imagem da roupa + imagem de pessoa

   **c) Outros:**
   - Pesquise: "outfit" ou "garment transfer"
   - Veja quais aparecem e leia a descrição

#### 5. **Depois de Escolher um Modelo:**

   1. **Clique no modelo** para abrir a página
   2. **Leia a descrição** para entender o que ele precisa:
      - Alguns precisam de 2 imagens (roupa + pessoa)
      - Outros podem gerar avatar automaticamente
   3. **Copie o nome do modelo:**
      - Exemplo: `omnious/vella`
   4. **Copie o ID da versão:**
      - Na página do modelo, procure "Version" ou "Latest"
      - Copie o ID completo (ex: `abc123def456...`)

#### 6. **Atualizar o Código:**

   1. Abra o arquivo: `lib/api/replicate-tryon.ts`
   2. Procure estas linhas (por volta da linha 40-45):
      ```typescript
      const MODEL_NAME = 'omnious/vella'
      const MODEL_VERSION = 'latest'
      ```
   3. **Substitua** com o modelo que você escolheu:
      ```typescript
      const MODEL_NAME = 'nome-do-modelo-que-voce-escolheu'
      const MODEL_VERSION = 'id-da-versao' // ou 'latest'
      ```

#### 7. **Verificar Parâmetros:**

   - Leia a documentação do modelo no Replicate
   - Alguns modelos precisam de `model_image` + `garment_image`
   - Outros precisam de `person_image` + `garment_image`
   - O código já está preparado para Vella, mas pode precisar ajustes

## 🎯 Modelo Mais Simples para Começar:

**Vella (omnious/vella)** é uma boa opção porque:
- ✅ É popular e bem documentado
- ✅ Funciona bem para try-on
- ✅ Tem exemplos claros no Replicate

### Como usar Vella:

1. Acesse: https://replicate.com/omnious/vella
2. Veja os exemplos na página
3. Copie o nome: `omnious/vella`
4. Copie o ID da versão mais recente
5. Atualize o código em `lib/api/replicate-tryon.ts`

## ⚠️ Importante:

- **Todos os modelos de try-on precisam de URL pública** (não base64)
- Se você não tiver Cloudinary, configure ou use outro serviço de upload
- Alguns modelos precisam de **2 imagens**: roupa + pessoa
- Outros podem gerar avatar automaticamente

## 🚀 Depois de Configurar:

1. Salve o arquivo `lib/api/replicate-tryon.ts`
2. O servidor vai recarregar automaticamente
3. Teste gerando uma imagem
4. Se der erro, me avise qual foi a mensagem!

## 💡 Dica:

Se você encontrar um modelo que gosta, me envie:
- Nome do modelo (ex: `omnious/vella`)
- ID da versão (se tiver)
- E eu atualizo o código para você!

