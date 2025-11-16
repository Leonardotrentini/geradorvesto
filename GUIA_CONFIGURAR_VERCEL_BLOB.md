# 🔧 GUIA: Configurar Vercel Blob Storage

## ❌ PROBLEMA

O erro indica que o `BLOB_READ_WRITE_TOKEN` não está configurado na Vercel. Este token é necessário para fazer upload de imagens e gerar URLs públicas para o Vella Try-On.

---

## ✅ SOLUÇÃO: Configurar BLOB_READ_WRITE_TOKEN

### Passo 1: Obter o Token na Vercel

1. **Acesse o Dashboard da Vercel:**
   - Vá para: https://vercel.com/dashboard
   - Faça login na sua conta

2. **Acesse as Configurações do Projeto:**
   - Clique no seu projeto (`geradorvesto` ou nome similar)
   - Vá em **Settings** (Configurações)
   - Clique em **Storage** no menu lateral

3. **Criar Blob Store (se ainda não criou):**
   - Se não tiver um Blob Store, clique em **Create Database**
   - Escolha **Blob** como tipo
   - Dê um nome (ex: `geradorfotos-blob`)
   - Clique em **Create**

4. **Obter o Token:**
   - Na página do Blob Store, vá em **Settings**
   - Procure por **Environment Variables** ou **Tokens**
   - Clique em **Create Token** ou **Generate Token**
   - Copie o token gerado (ele só aparece uma vez!)

---

### Passo 2: Adicionar Token nas Variáveis de Ambiente

1. **No Dashboard da Vercel:**
   - Vá em **Settings** → **Environment Variables**

2. **Adicionar Nova Variável:**
   - Clique em **Add New**
   - **Name:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** Cole o token que você copiou
   - **Environment:** Selecione **Production**, **Preview** e **Development** (ou pelo menos Production)
   - Clique em **Save**

3. **Verificar:**
   - A variável deve aparecer na lista
   - Certifique-se de que está habilitada para **Production**

---

### Passo 3: Fazer Redeploy

Após adicionar a variável de ambiente:

1. **Opção 1: Redeploy Manual**
   - Vá em **Deployments**
   - Clique nos três pontos (...) do último deploy
   - Selecione **Redeploy**
   - Confirme o redeploy

2. **Opção 2: Push no Git (Automático)**
   - Faça um pequeno commit e push
   - A Vercel fará deploy automaticamente

---

## 🔍 VERIFICAÇÃO

Após o redeploy, teste novamente:

1. Faça upload de uma imagem
2. Se funcionar, você verá a geração iniciar
3. Se ainda der erro, verifique:
   - Se o token está correto
   - Se está habilitado para Production
   - Se fez redeploy após adicionar

---

## 📝 NOTA ALTERNATIVA: Cloudinary

Se preferir usar Cloudinary (alternativa ao Vercel Blob):

1. **Criar conta no Cloudinary:**
   - Acesse: https://cloudinary.com
   - Crie uma conta gratuita

2. **Obter Credenciais:**
   - No Dashboard, vá em **Settings** → **Security**
   - Copie: `Cloud Name`, `API Key`, `API Secret`

3. **Adicionar na Vercel:**
   - Vá em **Settings** → **Environment Variables**
   - Adicione:
     - `CLOUDINARY_CLOUD_NAME` = seu cloud name
     - `CLOUDINARY_API_KEY` = sua API key
     - `CLOUDINARY_API_SECRET` = sua API secret

4. **Redeploy:**
   - Faça redeploy do projeto

---

## ✅ CHECKLIST

- [ ] Blob Store criado na Vercel
- [ ] Token gerado e copiado
- [ ] Variável `BLOB_READ_WRITE_TOKEN` adicionada
- [ ] Variável habilitada para Production
- [ ] Redeploy feito
- [ ] Teste realizado

---

## 🆘 AINDA COM PROBLEMAS?

Se ainda não funcionar:

1. **Verifique os logs da Vercel:**
   - Vá em **Deployments** → Último deploy → **Functions** → **Logs**
   - Procure por erros relacionados a Blob Storage

2. **Verifique se o token está correto:**
   - O token deve começar com `vercel_blob_rw_`
   - Não deve ter espaços ou quebras de linha

3. **Tente usar Cloudinary:**
   - Pode ser mais fácil de configurar
   - Tem plano gratuito generoso

---

**Status:** Aguardando configuração do token na Vercel.

