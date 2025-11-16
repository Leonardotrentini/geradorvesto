# 🎨 Arquitetura do App - Gerador de Fotos Humanizadas

## 📋 Visão Geral
App web para agência de moda que gera fotos humanizadas de produtos usando IA, permitindo personalização completa do avatar e cenário.

## 🏗️ Arquitetura Técnica

### Stack Tecnológica

#### Frontend
- **Next.js 14** (App Router) - Framework React full-stack
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling moderno e responsivo
- **Shadcn/ui** - Componentes UI de alta qualidade
- **React Dropzone** - Upload drag & drop de imagens
- **Zustand** - Gerenciamento de estado
- **React Query** - Cache e sincronização de dados
- **Framer Motion** - Animações suaves

#### Backend
- **Next.js API Routes** - Endpoints serverless
- **Node.js** - Runtime
- **Multer** - Upload de arquivos
- **Sharp** - Processamento de imagens

#### IA e Processamento
- **Stable Diffusion API** (Replicate/Stability AI) - Geração de imagens
- **ControlNet** - Controle preciso da geração
- **Inpainting** - Integração da peça no avatar

#### Armazenamento
- **Cloudinary** ou **AWS S3** - Armazenamento de imagens
- **PostgreSQL** (Supabase) ou **MongoDB** - Banco de dados
- **Redis** (opcional) - Cache de resultados

#### Deploy
- **Vercel** - Deploy automático
- **Cloudflare** - CDN e proteção

## 🎯 Funcionalidades Principais

### 1. Upload de Produto
- ✅ Drag & Drop de imagens
- ✅ Preview da imagem
- ✅ Validação de formato (JPG, PNG, WebP)
- ✅ Validação de tamanho (max 10MB)
- ✅ Crop/ajuste básico da imagem
- ✅ Remoção de fundo automática (opcional)

### 2. Personalização do Avatar
- ✅ **Gênero**: Homem / Mulher / Não-binário
- ✅ **Idade**: Slider (18-70 anos) ou faixas pré-definidas
- ✅ **Shape/Tipo de Corpo**: 
  - Magro / Atlético / Médio / Robusto / Plus Size
- ✅ **Etnia**: Diversidade inclusiva
- ✅ **Altura**: Baixo / Médio / Alto
- ✅ **Cor de cabelo**: Preto / Castanho / Loiro / Ruivo / Colorido
- ✅ **Estilo de cabelo**: Curto / Médio / Longo / Cacheado / Liso

### 3. Seleção de Cenário
- ✅ **Avatar**: Fundo neutro/transparente
- ✅ **Rua**: Ambiente urbano realista
- ✅ **Cenário**: Estúdio / Praia / Parque / Loja / Evento

### 4. Geração de Imagens
- ✅ Geração de 4 variações simultâneas
- ✅ Progress bar em tempo real
- ✅ Preview durante geração
- ✅ Download individual ou em lote
- ✅ Histórico de gerações
- ✅ Favoritos

### 5. Pós-Processamento
- ✅ Ajustes de brilho, contraste, saturação
- ✅ Filtros de estilo
- ✅ Remoção de fundo
- ✅ Adição de marca d'água (opcional)

### 6. Funcionalidades Extras
- ✅ **Histórico**: Salvar todas as gerações
- ✅ **Projetos**: Organizar por cliente/campanha
- ✅ **Exportação**: ZIP com todas as variações
- ✅ **Compartilhamento**: Link temporário
- ✅ **Templates**: Salvar configurações favoritas
- ✅ **Batch Processing**: Múltiplos produtos
- ✅ **API Key**: Integração com outros sistemas

## 📁 Estrutura de Pastas

```
geradorfotos/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rotas de autenticação
│   ├── (dashboard)/              # Dashboard principal
│   │   ├── page.tsx              # Home
│   │   ├── generate/             # Página de geração
│   │   ├── history/              # Histórico
│   │   └── projects/             # Projetos
│   ├── api/                      # API Routes
│   │   ├── upload/               # Upload de imagens
│   │   ├── generate/             # Geração de imagens
│   │   ├── history/              # Histórico
│   │   └── projects/             # Projetos
│   ├── layout.tsx                # Layout principal
│   └── globals.css               # Estilos globais
├── components/                   # Componentes React
│   ├── ui/                       # Componentes Shadcn
│   ├── upload/                   # Upload de imagens
│   │   ├── ImageDropzone.tsx
│   │   └── ImagePreview.tsx
│   ├── avatar/                   # Seletores de avatar
│   │   ├── GenderSelector.tsx
│   │   ├── AgeSelector.tsx
│   │   ├── ShapeSelector.tsx
│   │   └── AppearanceSelector.tsx
│   ├── scenario/                 # Seletores de cenário
│   │   └── ScenarioSelector.tsx
│   ├── generation/               # Geração
│   │   ├── GenerationPanel.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ResultGrid.tsx
│   └── layout/                   # Layout components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/                          # Utilitários
│   ├── api/                      # Clientes API
│   │   ├── replicate.ts          # Integração Replicate
│   │   ├── cloudinary.ts         # Cloudinary
│   │   └── storage.ts            # Storage
│   ├── utils/                    # Funções utilitárias
│   │   ├── image.ts              # Processamento de imagens
│   │   └── validation.ts         # Validações
│   └── store/                    # Zustand stores
│       ├── generationStore.ts
│       └── projectStore.ts
├── types/                        # TypeScript types
│   ├── generation.ts
│   └── avatar.ts
├── public/                       # Arquivos estáticos
│   ├── images/
│   └── icons/
├── .env.local                    # Variáveis de ambiente
├── next.config.js                # Config Next.js
├── tailwind.config.js            # Config Tailwind
├── tsconfig.json                 # Config TypeScript
└── package.json                  # Dependências
```

## 🔄 Fluxo de Uso

1. **Upload**: Cliente arrasta foto do produto
2. **Preview**: Visualização da imagem com opção de ajuste
3. **Personalização**: Seleção de avatar (gênero, idade, shape, etc.)
4. **Cenário**: Escolha do ambiente (avatar/rua/cenário)
5. **Geração**: Clique em "Gerar" → Processamento com IA
6. **Resultado**: 4 variações exibidas em grid
7. **Ações**: Download, favoritar, ajustar, regenerar

## 🔐 Segurança

- ✅ Validação de arquivos no servidor
- ✅ Rate limiting nas APIs
- ✅ Autenticação (opcional)
- ✅ Sanitização de inputs
- ✅ CORS configurado
- ✅ Variáveis de ambiente seguras

## 📊 Performance

- ✅ Lazy loading de imagens
- ✅ Image optimization (Next.js)
- ✅ Caching de resultados
- ✅ Compressão de imagens
- ✅ CDN para assets
- ✅ Server-side rendering quando possível

## 🚀 Próximos Passos

1. Setup inicial do projeto
2. Configuração de dependências
3. Criação de componentes base
4. Integração com API de IA
5. Testes e otimizações
6. Deploy


