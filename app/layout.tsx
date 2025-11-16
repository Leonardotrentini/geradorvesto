import type { Metadata } from 'next'
import { Playfair_Display, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '600', '700']
})

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '600', '700']
})

export const metadata: Metadata = {
  title: 'VESTO co. - Gerador de Fotos Humanizadas',
  description: 'Transforme seus produtos de moda em fotos realistas e humanizadas com IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${playfair.variable} ${cormorant.variable} font-vesto`}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a4d3a',
              color: '#d4af37',
              border: '1px solid #d4af37',
            },
          }}
        />
      </body>
    </html>
  )
}


