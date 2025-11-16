/**
 * Utilitários para compartilhamento social
 */

export interface ShareOptions {
  url?: string
  title?: string
  text?: string
  imageUrl?: string
}

/**
 * Compartilha via WhatsApp
 */
export function shareOnWhatsApp(options: ShareOptions): void {
  const { url, text } = options
  const message = text || 'Confira esta geração de moda!'
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + (url ? ` ${url}` : ''))}`
  window.open(whatsappUrl, '_blank')
}

/**
 * Compartilha via Instagram (abre app ou web)
 */
export function shareOnInstagram(imageUrl: string): void {
  // Instagram não permite compartilhamento direto via URL
  // Abre a página web do Instagram
  window.open('https://www.instagram.com/', '_blank')
  // Nota: Para compartilhar imagem, usuário precisa baixar e fazer upload manualmente
}

/**
 * Compartilha via Facebook
 */
export function shareOnFacebook(options: ShareOptions): void {
  const { url } = options
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || window.location.href)}`
  window.open(facebookUrl, '_blank', 'width=600,height=400')
}

/**
 * Compartilha via Twitter/X
 */
export function shareOnTwitter(options: ShareOptions): void {
  const { url, text } = options
  const message = text || 'Confira esta geração de moda!'
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url || window.location.href)}`
  window.open(twitterUrl, '_blank', 'width=600,height=400')
}

/**
 * Compartilha usando Web Share API (nativo do dispositivo)
 */
export async function shareNative(options: ShareOptions): Promise<void> {
  if (!navigator.share) {
    // Fallback: copia URL para clipboard
    if (options.url) {
      await navigator.clipboard.writeText(options.url)
      return
    }
    throw new Error('Web Share API não suportada e nenhuma URL fornecida')
  }

  try {
    await navigator.share({
      title: options.title || 'VESTO co. - Geração de Moda',
      text: options.text || 'Confira esta geração de moda!',
      url: options.url || window.location.href,
    })
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('Erro ao compartilhar:', error)
      throw error
    }
  }
}

/**
 * Copia link para clipboard
 */
export async function copyLinkToClipboard(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url)
  } catch (error) {
    console.error('Erro ao copiar link:', error)
    throw error
  }
}

/**
 * Gera link único para compartilhamento
 */
export function generateShareLink(generationId: string): string {
  return `${window.location.origin}/share/${generationId}`
}

