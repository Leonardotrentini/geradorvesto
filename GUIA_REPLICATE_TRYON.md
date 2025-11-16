# Guia: Configurar Virtual Try-On no Replicate

## ✅ O que você já fez:
- ✅ Cadastrou pagamento no Replicate
- ✅ Adicionou US$ 10 de crédito
- ✅ Código integrado e pronto

## 🔧 Próximo passo: Pegar a versão do modelo

O modelo de **Virtual Try-On** que preserva a peça de roupa é o **Outfit Anyone (OOTDiffusion)**.

### Passo a passo:

1. **Acesse o modelo no Replicate:**
   - Vá para: https://replicate.com/cuuupid/ootdiffusion
   - Ou pesquise por "ootdiffusion" no Replicate

2. **Copie o ID da versão:**
   - Na página do modelo, você verá algo como "Version: abc123def456..."
   - Clique na versão mais recente
   - Copie o **ID completo** da versão (ex: `abc123def456ghi789...`)

3. **Atualize o código:**
   - Abra o arquivo: `lib/api/replicate-tryon.ts`
   - Procure a linha que diz: `const model = 'cuuupid/ootdiffusion'`
   - Substitua por: `const model = 'cuuupid/ootdiffusion:SEU_ID_AQUI'`
   - Exemplo: `const model = 'cuuupid/ootdiffusion:abc123def456ghi789'`

4. **Salve e teste:**
   - Salve o arquivo
   - O servidor vai recarregar automaticamente
   - Teste gerando uma imagem

## 💰 Custos estimados:

- **Outfit Anyone (OOTDiffusion):** ~US$ 0.01 - 0.05 por geração
- Com US$ 10, você pode gerar **200-1000 imagens**

## 🔄 Alternativa: Outros modelos de Try-On

Se o modelo acima não funcionar, você pode tentar:

1. **IDM-VTON:**
   - Modelo: `cuuupid/idm-vton`
   - Link: https://replicate.com/cuuupid/idm-vton

2. **OutfitAnyone:**
   - Modelo: `levihsu/ootdiffusion`
   - Link: https://replicate.com/levihsu/ootdiffusion

## ⚠️ Importante:

- O modelo precisa de uma **URL pública** da imagem (não base64)
- Se você não tiver Cloudinary configurado, o código vai tentar usar base64
- Se der erro, configure Cloudinary ou use um serviço de upload temporário

## 🐛 Se der erro:

1. **Erro de versão:**
   - Verifique se copiou o ID completo da versão
   - Certifique-se de que a versão está ativa no Replicate

2. **Erro de imagem:**
   - O modelo pode precisar de URL pública
   - Configure Cloudinary ou use outro serviço de upload

3. **Erro de crédito:**
   - Verifique seu saldo no Replicate
   - Adicione mais crédito se necessário

## 📞 Próximos passos:

Depois de configurar, teste gerando uma imagem e me avise se funcionou!

