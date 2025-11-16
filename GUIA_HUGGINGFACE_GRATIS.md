# 🆓 Guia: Usar Hugging Face GRATUITO

## ✅ Por que Hugging Face?

- **100% GRATUITO** (sem cartão de crédito)
- Sem limites rígidos de créditos
- Modelos de alta qualidade
- Fácil de configurar

## 📝 Passo a Passo

### 1. Criar Conta no Hugging Face

1. Acesse: **https://huggingface.co/join**
2. Crie uma conta (pode usar Google/GitHub)
3. Confirme seu email

### 2. Obter API Token

1. Faça login em: **https://huggingface.co**
2. Clique no seu **avatar** (canto superior direito)
3. Selecione **"Settings"**
4. No menu lateral, clique em **"Access Tokens"**
5. Clique em **"New token"**
6. Dê um nome (ex: "gerador-fotos")
7. Selecione **"Read"** como permissão
8. Clique em **"Generate token"**
9. **COPIE O TOKEN** (você só verá uma vez!)

### 3. Adicionar Token no Projeto

1. Abra o arquivo `.env.local` na pasta do projeto
2. Adicione esta linha:

```env
HUGGINGFACE_API_TOKEN=seu_token_aqui
```

**Exemplo completo do `.env.local`:**

```env
REPLICATE_API_TOKEN=seu_token_replicate_aqui
HUGGINGFACE_API_TOKEN=seu_token_huggingface_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Salve o arquivo (`Ctrl + S`)

### 4. Reiniciar o Servidor

1. No terminal onde o servidor está rodando, pressione `Ctrl + C`
2. Execute novamente: `npm run dev`
3. Aguarde o servidor iniciar

### 5. Testar

1. Recarregue a página no navegador
2. Tente gerar uma imagem
3. Deve funcionar **GRATUITAMENTE**! 🎉

## 🔄 Como Funciona

O app agora tenta usar **Hugging Face primeiro** (gratuito). Se não funcionar, tenta Replicate como fallback.

## ⚠️ Limites do Hugging Face

- Modelo pode demorar alguns segundos para carregar na primeira vez
- Rate limit: ~30 requisições por minuto (muito generoso!)
- Se o modelo estiver "dormindo", a primeira requisição pode falhar (tente novamente)

## 🎯 Vantagens

✅ **Gratuito** - Sem cartão de crédito  
✅ **Sem créditos** - Não precisa comprar créditos  
✅ **Boa qualidade** - Modelos profissionais  
✅ **Fácil** - Só precisa do token  

## 🆚 Comparação

| Recurso | Hugging Face | Replicate |
|---------|------------|-----------|
| Custo | **GRATUITO** | Pago (créditos) |
| Cartão | Não precisa | Precisa |
| Limite | ~30/min | 6/min (sem pagamento) |
| Qualidade | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 💡 Dica

Você pode usar **ambos**! O app tenta Hugging Face primeiro, e se não funcionar, usa Replicate automaticamente.

---

**Pronto! Agora você tem uma solução 100% gratuita!** 🎉

