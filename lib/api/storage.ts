/**
 * Utilitários para armazenamento de imagens
 * Suporta Cloudinary e upload local
 */

export interface UploadResult {
  url: string
  publicId?: string
  secureUrl?: string
}

/**
 * Upload para Cloudinary
 */
export async function uploadToCloudinary(
  file: File | Buffer,
  folder: string = 'geradorfotos'
): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary não configurado. Configure as variáveis de ambiente.')
  }

  const formData = new FormData()
  
  if (file instanceof File) {
    formData.append('file', file)
  } else {
    formData.append('file', new Blob([file]), 'image.jpg')
  }
  
  formData.append('upload_preset', 'geradorfotos')
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('Erro ao fazer upload para Cloudinary')
  }

  const data = await response.json()
  
  return {
    url: data.secure_url,
    publicId: data.public_id,
    secureUrl: data.secure_url,
  }
}

/**
 * Upload local (para desenvolvimento)
 */
export async function uploadLocal(file: File): Promise<UploadResult> {
  // Em produção, use Cloudinary ou S3
  // Para desenvolvimento, podemos usar uma URL temporária
  const reader = new FileReader()
  
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      // Em produção, salve o arquivo no servidor e retorne a URL
      resolve({
        url: reader.result as string, // Data URL temporário
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Upload automático (escolhe o melhor método disponível)
 */
export async function uploadImage(
  file: File | Buffer,
  folder?: string
): Promise<UploadResult> {
  // Tenta Cloudinary primeiro, depois local
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      return await uploadToCloudinary(file, folder)
    }
  } catch (error) {
    console.warn('Erro ao fazer upload para Cloudinary, usando método local:', error)
  }

  if (file instanceof File) {
    return await uploadLocal(file)
  }

  throw new Error('Não foi possível fazer upload da imagem')
}


