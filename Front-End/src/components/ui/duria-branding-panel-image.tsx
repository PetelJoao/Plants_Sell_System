'use client'

import { Building2 } from 'lucide-react'
import Porshe from "@/public/images/Cadastro.jpeg"
export function DuriaBrandingPanelImage() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-8 lg:p-12 bg-cover bg-center relative overflow-hidden h-screen sticky top-0"
      style={{
        backgroundImage:'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Banyan%20Fig%20Studio-OnNzQ0BufA7hsm6UhjUnr7zkjdvKcT.jpeg)',
      }}>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Duria</h1>
        </div>

        {/* Tagline */}
        <div className="space-y-4">
          <h2 className="text-3xl font-light text-white leading-tight">
            Construindo o Futuro,
            <br />
           Um projecto de cada vez
          </h2>
          <p className="text-slate-200 text-lg font-light max-w-sm">
          Soluções arquitetônicas profissionais para design e construção modernos.
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-2 h-2 bg-blue-400 rounded-full" />
        <span className="text-slate-200 text-sm font-light">Criado para arquitetos</span>
      </div>
    </div>
  )
}
