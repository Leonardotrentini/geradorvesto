/**
 * EXEMPLO: Integração real com Replicate API
 * 
 * Substitua o conteúdo de app/api/generate/route.ts por este exemplo
 * após configurar REPLICATE_API_TOKEN no .env.local
 */

import { NextRequest, NextResponse } from 'next/server'
import { generationConfigSchema } from '@/lib/utils/validation'
import { uploadImage } from '@/lib/api/storage'
import { generateWithReplicate, generateFashionPrompt } from '@/lib/api/replicate'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const productImage = formData.get('productImage') as File
    const configStr = formData.get('config') as string

    if (!productImage) {
      return NextResponse.json(
        { error: 'Imagem do produto é obrigatória' },
        { status: 400 }
      )
    }

    // Validar arquivo
    if (productImage.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande (máx. 10MB)' },
        { status: 400 }
      )
    }

    const config = JSON.parse(configStr)

    // Validar configuração
    const validation = generationConfigSchema.safeParse({
      productImage,
      ...config,
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Configuração inválida', details: validation.error },
        { status: 400 }
      )
    }

    // 1. Fazer upload da imagem do produto
    const uploadResult = await uploadImage(productImage, 'products')
    const productImageUrl = uploadResult.url

    // 2. Gerar prompt otimizado
    const prompt = generateFashionPrompt({
      gender: config.avatar.gender,
      age: typeof config.avatar.age === 'number' ? config.avatar.age : 30,
      bodyShape: config.avatar.bodyShape,
      scenario: config.scenario,
      scenarioType: config.scenarioType,
    })

    // 3. Gerar imagens com Replicate
    const replicateResponse = await generateWithReplicate({
      productImageUrl,
      prompt,
      numOutputs: 4,
      negativePrompt: 'blurry, low quality, distorted, deformed, ugly, bad anatomy',
    })

    // 4. Retornar resultado
    // Se a geração for assíncrona, retornar jobId para polling
    if (replicateResponse.status === 'starting' || replicateResponse.status === 'processing') {
      return NextResponse.json({
        success: true,
        jobId: replicateResponse.id,
        status: 'processing',
        urls: replicateResponse.urls,
      })
    }

    // Se completou imediatamente (improvável, mas possível)
    if (replicateResponse.status === 'succeeded' && replicateResponse.output) {
      return NextResponse.json({
        success: true,
        result: {
          id: `gen_${Date.now()}`,
          images: replicateResponse.output,
          config: validation.data,
          createdAt: new Date(),
          status: 'completed',
        },
      })
    }

    // Erro
    return NextResponse.json(
      { error: replicateResponse.error || 'Erro ao gerar imagens' },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('Erro ao gerar imagens:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * Endpoint para verificar status de uma geração
 * GET /api/generate/status?jobId=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json(
      { error: 'jobId é obrigatório' },
      { status: 400 }
    )
  }

  try {
    const { checkGenerationStatus } = await import('@/lib/api/replicate')
    const status = await checkGenerationStatus(jobId)

    return NextResponse.json({
      success: true,
      status: status.status,
      output: status.output,
      error: status.error,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}


