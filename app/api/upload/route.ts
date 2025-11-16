/**
 * API Route para upload de imagens temporárias
 * Usa Vercel Blob Storage para criar URLs públicas
 * 
 * IMPORTANTE: Configure BLOB_READ_WRITE_TOKEN na Vercel
 */

import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use JPG, PNG ou WebP' },
        { status: 400 }
      )
    }

    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 10MB' },
        { status: 400 }
      )
    }

    // Upload para Vercel Blob Storage
    try {
      const blob = await put(file.name, file, {
        access: 'public',
        addRandomSuffix: true, // Adiciona sufixo aleatório para evitar conflitos
      })

      return NextResponse.json({
        success: true,
        url: blob.url,
        size: file.size,
        type: file.type,
      })
    } catch (blobError: any) {
      console.error('Erro ao fazer upload para Vercel Blob:', blobError)
      
      // Se Vercel Blob não estiver configurado, retornar erro claro
      if (blobError.message?.includes('BLOB_READ_WRITE_TOKEN')) {
        return NextResponse.json(
          { 
            error: 'Vercel Blob Storage não configurado. Configure BLOB_READ_WRITE_TOKEN nas variáveis de ambiente da Vercel.',
            hint: 'Veja GUIA_DEPLOY_VERCEL.md para instruções'
          },
          { status: 500 }
        )
      }

      throw blobError
    }
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer upload da imagem' },
      { status: 500 }
    )
  }
}

