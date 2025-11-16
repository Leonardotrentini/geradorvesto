/**
 * Utilitários para download de imagens
 */

/**
 * Baixa uma imagem individual
 */
export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('Erro ao baixar imagem')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Erro ao baixar imagem:', error)
    throw error
  }
}

/**
 * Baixa múltiplas imagens em um arquivo ZIP
 */
export async function downloadImagesAsZip(
  imageUrls: string[],
  filenames: string[],
  zipFilename: string = 'vesto-geracoes.zip'
): Promise<void> {
  try {
    // Usa JSZip para criar o arquivo ZIP
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    // Baixa cada imagem e adiciona ao ZIP
    const downloadPromises = imageUrls.map(async (url, index) => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Erro ao baixar imagem ${index + 1}`)
        }
        const blob = await response.blob()
        const filename = filenames[index] || `imagem-${index + 1}.jpg`
        zip.file(filename, blob)
      } catch (error) {
        console.error(`Erro ao processar imagem ${index + 1}:`, error)
      }
    })

    await Promise.all(downloadPromises)

    // Gera o arquivo ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = window.URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = zipFilename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Erro ao criar ZIP:', error)
    throw error
  }
}

