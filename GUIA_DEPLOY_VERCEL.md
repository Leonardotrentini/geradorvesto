# 🚀 Guia Completo: Deploy na Vercel

## ✅ Por que Vercel?

1. **URLs Públicas Automáticas** - Resolve o problema do Vella (não aceita base64)
2. **Deploy Automático** - Conecta com GitHub, deploy a cada push
3. **Performance** - CDN global, otimização automática
4. **Ambiente Real** - Testa em produção de verdade
5. **Gratuito** - Plano free generoso para começar
6. **Logs e Monitoramento** - Vê erros em tempo real

---

## 📋 PRÉ-REQUISITOS

1. ✅ Conta no GitHub (ou GitLab/Bitbucket)
2. ✅ Código commitado no repositório
3. ✅ Conta na Vercel (gratuita)

---

## 🎯 PASSO A PASSO COMPLETO

### PASSO 1: Preparar o Código

#### 1.1 Verificar se está tudo commitado
```bash
git status
```

Se houver arquivos não commitados:
```bash
git add .
git commit -m "Preparando para deploy na Vercel"
```

#### 1.2 Criar arquivo `.vercelignore` (opcional)
Crie `.vercelignore` na raiz do projeto:
```
.env*.local
.vercel
node_modules
.next
```

#### 1.3 Verificar `next.config.js`
Já está configurado corretamente! ✅

---

### PASSO 2: Criar Conta na Vercel

1. Acesse: **https://vercel.com/signup**
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"** (recomendado)
4. Autorize a Vercel a acessar seus repositórios

---

### PASSO 3: Fazer Deploy

#### Opção A: Via Dashboard (Mais Fácil)

1. Acesse: **https://vercel.com/new**
2. Clique em **"Import Git Repository"**
3. Selecione seu repositório do GitHub
4. Configure o projeto:
   - **Framework Preset:** Next.js (detecta automaticamente)
   - **Root Directory:** `./` (raiz)
   - **Build Command:** `npm run build` (automático)
   - **Output Directory:** `.next` (automático)
5. Clique em **"Deploy"**

#### Opção B: Via CLI (Mais Controle)

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. No diretório do projeto:
```bash
vercel
```

4. Siga as instruções:
   - Link to existing project? **N** (primeira vez)
   - Project name: **geradorfotos** (ou o que preferir)
   - Directory: **./** (raiz)
   - Override settings? **N**

5. Para deploy de produção:
```bash
vercel --prod
```

---

### PASSO 4: Configurar Variáveis de Ambiente

**CRÍTICO:** Configure todas as variáveis antes de testar!

1. No dashboard da Vercel, vá em **Settings** > **Environment Variables**
2. Adicione cada variável:

#### Variáveis Obrigatórias:
```
REPLICATE_API_TOKEN=seu_token_replicate_aqui
```

#### Variáveis Opcionais (mas recomendadas):
```
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

#### Variáveis Públicas (se necessário):
```
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
```

3. Para cada variável:
   - **Name:** Nome da variável
   - **Value:** Valor da variável
   - **Environment:** Selecione **Production**, **Preview**, e **Development**
   - Clique em **Save**

4. **IMPORTANTE:** Após adicionar variáveis, faça um novo deploy:
   - Vá em **Deployments**
   - Clique nos **3 pontos** do último deployment
   - Selecione **Redeploy**

---

### PASSO 5: Configurar URLs Públicas (CRÍTICO)

O Vella precisa de URLs públicas. Temos 3 opções:

#### Opção 1: Vercel Blob Storage (Recomendado - Gratuito)

1. Instale o pacote:
```bash
npm install @vercel/blob
```

2. Crie API route para upload: `app/api/upload/route.ts`
```typescript
import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  const blob = await put(file.name, file, {
    access: 'public',
  })

  return NextResponse.json({ url: blob.url })
}
```

3. Configure no Vercel:
   - Vá em **Settings** > **Storage**
   - Clique em **Create Database**
   - Selecione **Blob**
   - Dê um nome (ex: "vesto-images")
   - Clique em **Create**

#### Opção 2: API Route Temporária (Mais Simples)

Criar uma API route que serve as imagens temporariamente:
```typescript
// app/api/images/[id]/route.ts
// Serve imagens temporárias por ID
```

#### Opção 3: Cloudinary (Já configurado)

Se já tem Cloudinary, use as variáveis de ambiente acima.

---

### PASSO 6: Testar o Deploy

1. Acesse sua URL: `https://seu-projeto.vercel.app`
2. Teste o fluxo completo:
   - Upload de imagem
   - Geração
   - Download

3. Verifique os logs:
   - Vá em **Deployments** > Clique no deployment > **Functions** > Veja os logs

---

## 🔧 CONFIGURAÇÕES ADICIONAIS

### Configurar Domínio Customizado (Opcional)

1. Vá em **Settings** > **Domains**
2. Adicione seu domínio
3. Siga as instruções de DNS

### Configurar Deploy Automático

1. Vá em **Settings** > **Git**
2. Conecte seu repositório (se ainda não conectou)
3. Configure:
   - **Production Branch:** `main` ou `master`
   - **Auto-deploy:** Ativado

Agora, cada push na branch principal faz deploy automático!

---

## 🐛 TROUBLESHOOTING

### Erro: "Environment variables not found"
**Solução:** Adicione as variáveis no dashboard da Vercel e faça redeploy.

### Erro: "Build failed"
**Solução:** 
1. Veja os logs do build
2. Verifique se todas as dependências estão no `package.json`
3. Teste localmente: `npm run build`

### Erro: "Function timeout"
**Solução:**
- Vercel free: 10s timeout
- Vercel Pro: 60s timeout
- Para gerações longas, use polling (já implementado)

### Imagens não aparecem
**Solução:**
1. Verifique `next.config.js` - domínios permitidos
2. Verifique se URLs são públicas
3. Veja console do navegador para erros CORS

---

## 📊 MONITORAMENTO

### Ver Logs em Tempo Real

1. Vá em **Deployments**
2. Clique no deployment ativo
3. Vá em **Functions**
4. Veja logs em tempo real

### Ver Métricas

1. Vá em **Analytics** (plano Pro)
2. Veja:
   - Requisições por minuto
   - Tempo de resposta
   - Erros

---

## 🚀 PRÓXIMOS PASSOS APÓS DEPLOY

1. ✅ Testar geração completa
2. ✅ Verificar se URLs públicas funcionam
3. ✅ Ajustar baseado em logs
4. ✅ Configurar domínio customizado (opcional)
5. ✅ Compartilhar URL com clientes

---

## 💰 CUSTOS

### Plano Free (Hobby)
- ✅ Gratuito para sempre
- ✅ 100GB bandwidth/mês
- ✅ Deploys ilimitados
- ✅ Domínios customizados
- ⚠️ Timeout de 10s (pode ser limitante)

### Plano Pro ($20/mês)
- ✅ Tudo do free
- ✅ Timeout de 60s
- ✅ Analytics avançado
- ✅ Mais bandwidth

**Para começar, o plano free é suficiente!**

---

## ✅ CHECKLIST FINAL

Antes de considerar deploy completo:

- [ ] Código commitado no GitHub
- [ ] Conta na Vercel criada
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] URLs públicas funcionando (Vercel Blob ou Cloudinary)
- [ ] Teste completo de geração
- [ ] Logs verificados
- [ ] Sem erros críticos

---

**Pronto para fazer deploy? Siga os passos acima!** 🚀

