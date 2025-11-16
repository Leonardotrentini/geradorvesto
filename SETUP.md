# 🚀 Guia de Setup e Configuração

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Conta em um serviço de IA (Replicate, Stability AI, etc.)
- (Opcional) Conta no Cloudinary para armazenamento

## Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione suas chaves de API:

```env
# API de IA (escolha uma)
REPLICATE_API_TOKEN=seu_token_aqui
# ou
STABILITY_API_KEY=sua_chave_aqui

# Storage (opcional, mas recomendado)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Obter API Keys

### Replicate (Recomendado)
1. Acesse https://replicate.com
2. Crie uma conta
3. Vá em Account Settings > API Tokens
4. Copie o token

### Stability AI (Alternativa)
1. Acesse https://platform.stability.ai
2. Crie uma conta
3. Vá em Account > API Keys
4. Crie uma nova chave

### Cloudinary (Opcional)
1. Acesse https://cloudinary.com
2. Crie uma conta gratuita
3. No Dashboard, copie:
   - Cloud Name
   - API Key
   - API Secret

## Executar

```bash
npm run dev
```

Acesse http://localhost:3000

## Próximos Passos

1. **Integrar API de IA real:**
   - Edite `lib/api/replicate.ts` ou crie integração com outro serviço
   - Atualize `app/api/generate/route.ts` para usar a integração

2. **Configurar armazenamento:**
   - Configure Cloudinary ou AWS S3
   - Atualize `lib/api/storage.ts` se necessário

3. **Adicionar banco de dados (opcional):**
   - Para histórico e projetos
   - Recomendado: Supabase (PostgreSQL) ou MongoDB

4. **Deploy:**
   - Vercel (recomendado): `vercel deploy`
   - Configure variáveis de ambiente no painel do Vercel

## Estrutura de Pastas

```
app/              # Páginas Next.js
components/       # Componentes React
lib/             # Utilitários e APIs
types/           # TypeScript types
public/          # Arquivos estáticos
```

## Troubleshooting

### Erro: "REPLICATE_API_TOKEN não configurado"
- Verifique se `.env.local` existe
- Confirme que a variável está correta
- Reinicie o servidor de desenvolvimento

### Erro ao fazer upload
- Verifique tamanho do arquivo (máx. 10MB)
- Confirme formato (JPG, PNG, WebP)
- Se usar Cloudinary, verifique as credenciais

### Imagens não geram
- Verifique se a API key está válida
- Confirme créditos na conta do serviço de IA
- Veja logs no console do servidor

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação Next.js: https://nextjs.org/docs
- Documentação Replicate: https://replicate.com/docs
- ARQUITETURA.md para detalhes técnicos


