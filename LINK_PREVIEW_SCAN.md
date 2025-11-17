# 🔗 LINK DO PREVIEW - MÓDULO 1: SCAN DA PEÇA

## 🚀 ACESSE A INTERFACE

### **URL Local:**
```
http://localhost:3000/scan
```

### **URL de Produção (Vercel):**
```
https://seu-projeto.vercel.app/scan
```

---

## 📋 FUNCIONALIDADES DA INTERFACE

### **1. Upload da Peça**
- ✅ Drag & Drop de imagens
- ✅ Preview da imagem
- ✅ Validação em tempo real
- ✅ Botão "Escanear Peça"

### **2. Resultado do Scan**
- ✅ Garment ID único
- ✅ Metadados (tipo, cor, padrão, qualidade, dimensões)
- ✅ Preview da imagem normalizada
- ✅ Preview da máscara
- ✅ Botões de download
- ✅ Indicador de qualidade (score 0-10)

### **3. Informações**
- ✅ Explicação do que o scan faz
- ✅ Requisitos da imagem
- ✅ Dicas de qualidade

---

## 🎯 COMO USAR

1. **Acesse:** `http://localhost:3000/scan`
2. **Faça upload** de uma foto da roupa
3. **Clique em "Escanear Peça"**
4. **Aguarde** o processamento (30s - 2min)
5. **Veja o resultado:**
   - Garment ID
   - Metadados
   - Imagem normalizada
   - Máscara
6. **Baixe** as imagens se necessário

---

## ⚠️ NOTAS

- O servidor deve estar rodando (`npm run dev`)
- Certifique-se de que `REPLICATE_API_TOKEN` está configurado
- Certifique-se de que `BLOB_READ_WRITE_TOKEN` está configurado (Vercel)

---

**Status:** ✅ Interface criada - Pronta para testar!

