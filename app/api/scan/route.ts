/**
 * API Route para Scan da Peça (Módulo 1)
 * 
 * Endpoint: POST /api/scan
 * 
 * Recebe: imagem da roupa (File)
 * Retorna: garment_id, garment_image, garment_mask, metadata
 */

import { NextRequest, NextResponse } from 'next/server'
import { scanGarment } from '@/lib/modules/garment-scanner/scanner'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem é obrigatória' },
        { status: 400 }
      )
    }

    // Valida tamanho
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande (máx. 10MB)' },
        { status: 400 }
      )
    }

    console.log('🔵 Iniciando scan da peça...')
    console.log(`   - Arquivo: ${image.name}`)
    console.log(`   - Tamanho: ${(image.size / 1024).toFixed(2)}KB`)

    // Executa pipeline completa de scan
    const result = await scanGarment({
      image,
    })

    console.log('✅ Scan concluído com sucesso')
    console.log(`   - Garment ID: ${result.garment_id}`)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error: any) {
    console.error('❌ Erro ao fazer scan da peça:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao fazer scan da peça',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * Endpoint para buscar garment por ID
 * GET /api/scan?garmentId=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const garmentId = searchParams.get('garmentId')

  if (!garmentId) {
    return NextResponse.json(
      { error: 'garmentId é obrigatório' },
      { status: 400 }
    )
  }

  try {
    // TODO: Implementar busca no storage
    return NextResponse.json({
      success: false,
      error: 'Busca de garment ainda não implementada',
    }, { status: 501 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar garment' },
      { status: 500 }
    )
  }
}

