'use client'

import { Download, Heart, Share2, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ResultGridProps {
  images: string[]
  onDownload?: (imageUrl: string, index: number) => void
  onFavorite?: (imageUrl: string, index: number) => void
  onShare?: (imageUrl: string) => void
}

export function ResultGrid({ images, onDownload, onFavorite, onShare }: ResultGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  const handleFavorite = (index: number) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(index)) {
      newFavorites.delete(index)
    } else {
      newFavorites.add(index)
    }
    setFavorites(newFavorites)
    onFavorite?.(images[index], index)
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `foto-humanizada-${index + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      onDownload?.(imageUrl, index)
    } catch (error) {
      console.error('Erro ao baixar imagem:', error)
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-500 transition-colors"
          >
            <img
              src={imageUrl}
              alt={`Variação ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setSelectedImage(imageUrl)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => handleDownload(imageUrl, index)}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => handleFavorite(index)}
                className={favorites.has(index) ? 'bg-red-500 text-white' : ''}
              >
                <Heart className={`w-4 h-4 ${favorites.has(index) ? 'fill-current' : ''}`} />
              </Button>
              {onShare && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => onShare(imageUrl)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
              Variação {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Preview ampliado"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

