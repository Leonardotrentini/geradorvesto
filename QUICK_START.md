# ⚡ Quick Start

## 🚀 Início Rápido (5 minutos)

### 1. Instalar
```bash
npm install
```

### 2. Configurar (mínimo)
Crie `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Executar
```bash
npm run dev
```

### 4. Acessar
Abra http://localhost:3000

## 🎯 Para Usar com IA Real

### Opção 1: Replicate (Recomendado)
1. Crie conta em https://replicate.com
2. Obtenha API token
3. Adicione no `.env.local`:
```env
REPLICATE_API_TOKEN=seu_token_aqui
```
4. Substitua `app/api/generate/route.ts` pelo conteúdo de `app/api/generate/route.example.ts`

### Opção 2: Cloudinary (Opcional)
Para armazenamento de imagens:
1. Crie conta em https://cloudinary.com
2. Adicione no `.env.local`:
```env
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

## 📁 Estrutura Principal

```
app/
  page.tsx              # Home
  generate/
    page.tsx            # Gerador principal
    result/page.tsx     # Resultados
  api/
    generate/route.ts   # API de geração

components/
  upload/               # Upload de imagens
  avatar/               # Seletores de avatar
  scenario/             # Seletores de cenário
  generation/           # Componentes de geração
```

## 🎨 Funcionalidades Atuais

✅ Upload drag & drop
✅ Personalização completa de avatar
✅ Seleção de cenário
✅ Interface moderna e responsiva
✅ Preview de resultados
✅ Download de imagens

## 🔄 Próximos Passos

1. Configure API de IA (Replicate)
2. Teste o fluxo completo
3. Personalize conforme necessário
4. Deploy no Vercel

## 📚 Documentação Completa

- `ARQUITETURA.md` - Arquitetura detalhada
- `FUNCIONALIDADES.md` - Lista completa de funcionalidades
- `SETUP.md` - Guia de setup completo


