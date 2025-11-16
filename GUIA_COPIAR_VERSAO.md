# 📋 Guia: Copiar ID da Versão do Modelo Vella

## 🎯 O que você precisa fazer:

Copiar o **ID da versão** do modelo Vella no Replicate e colar no código.

---

## 📝 Passo a Passo:

### **1. Acesse a página do modelo:**
   - Vá para: **https://replicate.com/omnious/vella**
   - Ou pesquise "vella" no Replicate

### **2. Encontre o ID da versão:**

   **Opção A - Na página do modelo:**
   - Procure por "Version" ou "Latest version"
   - Você verá algo como: `abc123def456ghi789...` (um código longo)
   - **COPIE esse código completo**

   **Opção B - Na aba "API":**
   - Clique na aba **"API"** na página do modelo
   - Procure por exemplos de código
   - Você verá algo como:
     ```python
     version = "abc123def456ghi789..."
     ```
   - **COPIE o ID que está entre aspas**

   **Opção C - Na aba "Code":**
   - Clique na aba **"Code"** ou **"Node.js"** / **"Python"**
   - Procure por `version:` ou `version=`
   - **COPIE o ID que aparece depois**

### **3. Exemplo do que você vai encontrar:**

   O ID da versão é um código longo, tipo:
   ```
   abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
   ```

   Ou pode aparecer assim:
   ```
   abc123def456...
   ```

### **4. Depois de copiar:**

   Me envie o ID completo e eu atualizo o código para você!

   Ou você mesmo pode atualizar:
   - Abra: `lib/api/replicate-tryon.ts`
   - Procure a linha: `const MODEL_VERSION = 'latest'`
   - Substitua por: `const MODEL_VERSION = 'SEU_ID_AQUI'`
   - Exemplo: `const MODEL_VERSION = 'abc123def456ghi789...'`

---

## 🔍 Dica:

Se você não encontrar o ID:
1. Tente clicar em "View all versions" ou "Versions"
2. Ou procure na seção "API" da página
3. O ID geralmente tem 40+ caracteres

---

## ✅ Depois de atualizar:

1. Salve o arquivo
2. O servidor vai recarregar automaticamente
3. Teste novamente gerando uma imagem

---

**Me envie o ID que você encontrou e eu atualizo o código para você!** 🚀

