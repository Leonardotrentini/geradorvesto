/**
 * Integração com Stability AI para geração de imagens
 *
 * Para simplificar o MVP, usamos o endpoint v1 de text-to-image
 * estável e bem documentado.
 *
 * Endpoint: https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image
 * Docs: https://platform.stability.ai/docs/api-reference#tag/v1generation
 */

// Usamos o modelo estável e amplamente disponível v1-5
const STABILITY_API_URL =
  'https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image'

export interface StabilityGenerationRequest {
  prompt: string
  negativePrompt?: string
}

export interface StabilityGenerationResponse {
  image: string // data URL (base64)
}

export async function generateWithStability(
  request: StabilityGenerationRequest
): Promise<StabilityGenerationResponse> {
  const apiKey = process.env.STABILITY_API_KEY?.trim()

  if (!apiKey || apiKey.length === 0) {
    throw new Error('STABILITY_API_KEY não configurado. Adicione sua chave da Stability AI no .env.local')
  }

  // Endpoint v1 retorna JSON com artifacts em base64
  const response = await fetch(STABILITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [
        { text: request.prompt },
        {
          text:
            request.negativePrompt ||
            'blurry, low quality, distorted, deformed, ugly, bad anatomy',
          weight: -1,
        },
      ],
      cfg_scale: 7,
      height: 512,
      width: 512,
      samples: 1,
      steps: 30,
    }),
  })

  if (!response.ok) {
    let errorText = `Erro HTTP ${response.status}`
    try {
      const err = (await response.json()) as any
      if (Array.isArray(err?.errors) && err.errors.length > 0) {
        errorText = err.errors.map((e: any) => e.message || e).join(' | ')
      } else {
        errorText = err.message || err.error || errorText
      }
    } catch {
      // mantém mensagem genérica se não der pra ler JSON
    }
    throw new Error(`Stability AI: ${errorText}`)
  }

  const data = (await response.json()) as any

  if (!data?.artifacts || !Array.isArray(data.artifacts) || data.artifacts.length === 0) {
    throw new Error('Stability AI não retornou nenhuma imagem')
  }

  const artifact = data.artifacts[0]
  if (!artifact?.base64) {
    throw new Error('Stability AI retornou resposta sem base64 da imagem')
  }

  const base64 = artifact.base64 as string
  const mimeType = 'image/png'

  return {
    image: `data:${mimeType};base64,${base64}`,
  }
}


