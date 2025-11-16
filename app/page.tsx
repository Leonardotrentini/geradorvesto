import Link from 'next/link'
import { ArrowRight, Sparkles, Image as ImageIcon, Settings } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-vesto-green">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          {/* Logo VESTO co. */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold text-gold-bright mb-2 tracking-tight">
              VESTO
            </h1>
            <p className="text-xl text-gold font-light tracking-widest">co.</p>
          </div>
          
          <div className="inline-flex items-center gap-2 border border-gold/30 bg-gold/5 px-4 py-2 rounded-full text-sm font-light text-gold mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by IA
          </div>
          
          <h2 className="text-4xl md:text-5xl font-semibold text-gold mb-4 font-vesto">
            Gerador de Fotos Humanizadas
          </h2>
          <p className="text-lg text-gold/80 max-w-2xl mx-auto font-light">
            Transforme seus produtos de moda em fotos realistas e humanizadas
            com personalização completa de avatar e cenário
          </p>
        </header>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#1a4d3a]/80 backdrop-blur-sm p-6 rounded-lg border border-gold/20 hover:border-gold/40 transition-all">
            <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gold">Upload Simples</h3>
            <p className="text-gold/70 font-light">
              Arraste e solte a foto do seu produto. Suporta JPG, PNG e WebP.
            </p>
          </div>

          <div className="bg-[#1a4d3a]/80 backdrop-blur-sm p-6 rounded-lg border border-gold/20 hover:border-gold/40 transition-all">
            <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gold">Personalização Total</h3>
            <p className="text-gold/70 font-light">
              Escolha gênero, idade, shape, cenário e muito mais para seu avatar.
            </p>
          </div>

          <div className="bg-[#1a4d3a]/80 backdrop-blur-sm p-6 rounded-lg border border-gold/20 hover:border-gold/40 transition-all">
            <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gold">4 Variações</h3>
            <p className="text-gold/70 font-light">
              Receba 4 variações únicas de cada geração para escolher a melhor.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 bg-gold-gradient text-[#1a4d3a] px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl border border-gold/50"
          >
            Começar Agora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* How it works */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gold">Como Funciona</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Upload', desc: 'Envie a foto do produto' },
              { step: '2', title: 'Personalize', desc: 'Configure avatar e cenário' },
              { step: '3', title: 'Gere', desc: 'IA cria 4 variações' },
              { step: '4', title: 'Download', desc: 'Baixe suas imagens' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gold-gradient text-[#1a4d3a] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 border border-gold/50 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2 text-gold">{item.title}</h3>
                <p className="text-sm text-gold/70 font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


