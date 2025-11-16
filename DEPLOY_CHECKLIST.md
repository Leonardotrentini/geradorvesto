# ✅ Checklist de Deploy na Vercel

## Antes do Deploy

- [ ] Código commitado no Git
- [ ] `package.json` atualizado com todas as dependências
- [ ] `next.config.js` configurado corretamente
- [ ] `.env.local` não commitado (já está no `.gitignore`)

## Durante o Deploy

- [ ] Criar conta na Vercel
- [ ] Importar repositório do GitHub
- [ ] Configurar variáveis de ambiente:
  - [ ] `REPLICATE_API_TOKEN`
  - [ ] `CLOUDINARY_CLOUD_NAME` (opcional)
  - [ ] `CLOUDINARY_API_KEY` (opcional)
  - [ ] `CLOUDINARY_API_SECRET` (opcional)
  - [ ] `NEXT_PUBLIC_APP_URL` (será preenchido automaticamente)
- [ ] Fazer primeiro deploy
- [ ] Verificar se build foi bem-sucedido

## Após o Deploy

- [ ] Acessar URL do projeto
- [ ] Testar upload de imagem
- [ ] Testar geração completa
- [ ] Verificar logs em caso de erro
- [ ] Configurar Vercel Blob Storage (se necessário)
- [ ] Testar URLs públicas funcionando

## Configuração de URLs Públicas (CRÍTICO)

Escolha UMA opção:

### Opção 1: Vercel Blob Storage (Recomendado)
- [ ] Instalar `@vercel/blob` (já feito)
- [ ] Criar Blob Storage no dashboard da Vercel
- [ ] Testar upload via `/api/upload`
- [ ] Verificar se URLs são públicas

### Opção 2: Cloudinary
- [ ] Criar conta no Cloudinary
- [ ] Configurar variáveis de ambiente
- [ ] Testar upload
- [ ] Verificar URLs públicas

## Testes Finais

- [ ] Upload de roupa funciona
- [ ] Upload de pessoa funciona
- [ ] Geração de avatar funciona
- [ ] Geração de manequim funciona
- [ ] Download funciona
- [ ] Compartilhamento funciona
- [ ] Sem erros nos logs

## Problemas Comuns

### "Environment variables not found"
- [ ] Verificar se variáveis foram adicionadas
- [ ] Verificar se foram adicionadas para o ambiente correto (Production)
- [ ] Fazer redeploy após adicionar variáveis

### "Build failed"
- [ ] Verificar logs do build
- [ ] Testar `npm run build` localmente
- [ ] Verificar se todas as dependências estão no `package.json`

### "Function timeout"
- [ ] Verificar se está usando polling (já implementado)
- [ ] Considerar upgrade para plano Pro (60s timeout)

### "URLs base64 não funcionam"
- [ ] Configurar Cloudinary OU Vercel Blob
- [ ] Verificar se URLs são públicas (começam com http:// ou https://)
- [ ] Testar acesso às URLs manualmente

---

**Status:** ⏳ Aguardando deploy
**Última atualização:** 2024

