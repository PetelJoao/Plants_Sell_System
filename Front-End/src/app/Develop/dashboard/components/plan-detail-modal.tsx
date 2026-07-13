// components/PlanDetailModal.tsx
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Lock, X, MessageSquare, ShieldCheck, Trash2, Building2, Ruler, BedDouble, Bath, FileText, User as UserIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BotaoComprar } from "@/components/BotaoComprar"
import { useAuth } from "@/Context/AuthContext"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// ── Tipos ──────────────────────────────────────
interface Comentario {
  id: string
  autor_id: string
  nome_autor: string
  conteudo: string
  created_at: string
}

interface PlanDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: {
    id: string
    title: string
    description: string
    price: number
    category: string
    squareFeet: number
    bedrooms: number
    bathrooms: number
    image?: string
    uploadedAt?: string
    architect?: string
    architectImage?: string
    dono: string
  }
}

// ── Sub-componente: formulário + lista de comentários ──
function ComentariosSection({ plantaId }: { plantaId: string }) {
  const { user } = useAuth() as any
  const { toast } = useToast()

  const [comentarios, setComentarios]   = useState<Comentario[]>([])
  const [podeComentar, setPodeComentar] = useState(false)
  const [conteudo, setConteudo]         = useState("")
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)

  // Carrega comentários e verifica permissão ao montar
  useEffect(() => {
    if (!plantaId) return
    let cancelled = false

    async function load() {
      const token = localStorage.getItem("token")

      // Comentários são públicos
      const res = await fetch(`${API}/api/comments/${plantaId}`)
      const data = await res.json()
      // Garante que é sempre um array
      if (!cancelled) setComentarios(Array.isArray(data) ? data : [])

      // Permissão só se autenticado
      if (token) {
        const permRes = await fetch(
          `${API}/api/comments/${plantaId}/pode-comentar`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (permRes.ok && !cancelled) {
          const perm = await permRes.json()
          setPodeComentar(perm.pode_comentar)
        }
      }

      if (!cancelled) setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [plantaId])

  const handleSubmit = async () => {
    if (conteudo.trim().length < 3) return
    setSubmitting(true)

    const token = localStorage.getItem("token")
    const res = await fetch(`${API}/api/comments/${plantaId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ conteudo }),
    })

    if (res.ok) {
      const novo = await res.json()
      setComentarios((prev) => [novo, ...prev])
      setConteudo("")
      toast({ title: "Comentário publicado!", description: "A tua opinião foi partilhada com sucesso." })
    } else {
      const err = await res.json()
      toast({ title: "Erro", description: err.detail || "Não foi possível publicar.", variant: "destructive" })
    }

    setSubmitting(false)
  }

  const handleDelete = async (commentId: string) => {
    const token = localStorage.getItem("token")
    const res = await fetch(`${API}/api/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.ok) {
      setComentarios((prev) => prev.filter((c) => c.id !== commentId))
      toast({ title: "Comentário apagado." })
    }
  }

  const isAdmin = user?.role === "admin"

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#C79A56] border-t-transparent" />
        <p className="text-sm text-[#55617A]">A carregar comentários...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Formulário — só para compradores verificados */}
      {podeComentar ? (
        <div className="space-y-3 p-4 bg-[#3F7A5C]/8 border border-[#3F7A5C]/25 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-[#2f5c46] font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Compra verificada — pode comentar publicamente
          </div>
          <Textarea
            rows={3}
            placeholder="Partilhe a sua experiência com este projecto..."
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            maxLength={1000}
            className="bg-white rounded-lg border-[#E4E0D8] focus-visible:ring-2 focus-visible:ring-[#C79A56]/40"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#55617A]">{conteudo.length}/1000</span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || conteudo.trim().length < 3}
              className="rounded-full bg-[#101A2E] text-white hover:bg-[#1c2c4a]"
            >
              {submitting ? "A publicar..." : "Publicar comentário"}
            </Button>
          </div>
        </div>
      ) : (
        // Mensagem subtil se não comprou (só aparece se estiver logado)
        user && (
          <p className="text-xs text-[#55617A] italic">
            Apenas compradores verificados podem comentar neste projecto.
          </p>
        )
      )}

      {/* Lista */}
      {comentarios.length === 0 ? (
        <p className="text-sm text-[#55617A] italic text-center py-4">
          Ainda não há comentários. Seja o primeiro a partilhar a sua experiência.
        </p>
      ) : (
        <div className="space-y-3">
          {comentarios.map((c) => (
            <div key={c.id} className="flex gap-3 pb-4 border-b border-[#E4E0D8] last:border-b-0">
              {/* Avatar inicial */}
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-[#101A2E] flex items-center justify-center text-sm font-bold text-[#C79A56]">
                {c.nome_autor.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#101A2E]">{c.nome_autor}</span>
                      <Badge variant="outline" className="text-[10px] border-[#3F7A5C]/40 text-[#2f5c46] bg-[#3F7A5C]/8 py-0 rounded-full">
                        Comprador verificado
                      </Badge>
                    </div>
                    <p className="text-xs text-[#55617A] mt-0.5">
                      {new Date(c.created_at).toLocaleDateString("pt-AO", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Apagar — autor ou admin */}
                  {(isAdmin || user?.id === c.autor_id) && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-[#55617A] hover:text-red-600 transition-colors flex-shrink-0"
                      title="Apagar comentário"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#3a4256] mt-1.5 leading-relaxed whitespace-pre-wrap">
                  {c.conteudo}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Modal principal ────────────────────────────
export function PlanDetailModal({ open, onOpenChange, plan }: PlanDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(plan.image || "/placeholder.png")

  const images   = [plan.image || "/placeholder.png", plan.image || "/placeholder.png", plan.image || "/placeholder.png"]
  const documents = [
    { id: 1, name: "Floor_Plan_Level_1.pdf" },
    { id: 2, name: "Floor_Plan_Level_2.pdf" },
    { id: 3, name: "Elevation_Views.pdf" },
    { id: 4, name: "3D_Model.skp" },
    { id: 5, name: "Material_Specifications.pdf" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap");
        .font-display { font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif; }
        .font-mono-label { font-family: "IBM Plex Mono", ui-monospace, monospace; letter-spacing: 0.06em; }
        .duria-scroll::-webkit-scrollbar { width: 8px; }
        .duria-scroll::-webkit-scrollbar-track { background: transparent; }
        .duria-scroll::-webkit-scrollbar-thumb { background-color: #E4E0D8; border-radius: 9999px; }
        .duria-scroll::-webkit-scrollbar-thumb:hover { background-color: #C79A56; }
        .duria-scroll { scrollbar-width: thin; scrollbar-color: #E4E0D8 transparent; }
      `}</style>
      <DialogContent className="duria-scroll max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border border-[#E4E0D8] font-[Inter,sans-serif]">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#E4E0D8] p-5 sm:p-6 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <p className="font-mono-label text-[11px] uppercase text-[#8a6a38] truncate">
              {(plan.architect || "Arquiteto") + " • " + plan.category}
            </p>
            <DialogTitle className="font-display mt-1 text-xl sm:text-2xl font-bold text-[#101A2E] truncate">
              {plan.title}
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-[#55617A] hover:bg-[#F7F5F1] hover:text-[#101A2E] shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-5 sm:p-6 space-y-8 bg-[#F7F5F1]">
          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Galeria */}
            <div className="lg:col-span-1 space-y-3">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#101A2E] shadow-lg shadow-[#101A2E]/10 border border-[#E4E0D8]">
                <Image src={selectedImage} alt={plan.title} fill className="object-cover" />
              </div>
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Ver imagem ${idx + 1}`}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? "border-[#C79A56] ring-2 ring-[#C79A56]/30"
                        : "border-[#E4E0D8] hover:border-[#C79A56]/50 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                {plan.architectImage ? (
                  <Image src={plan.architectImage} alt={plan.architect || "Architect"} width={40} height={40} className="rounded-full border border-[#E4E0D8]" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[#101A2E] flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-[#C79A56]" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm text-[#101A2E]">{plan.architect || "Architect"}</p>
                  <p className="text-xs text-[#55617A]">Uploaded {plan.uploadedAt || "Recently"}</p>
                </div>
              </div>

              <p className="text-[#55617A] leading-relaxed">{plan.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-[#E4E0D8] rounded-xl">
                  <Building2 className="h-4 w-4 text-[#8a6a38] mb-1.5" />
                  <p className="text-[10px] font-mono-label uppercase text-[#55617A]">Categoria</p>
                  <p className="font-display font-semibold text-[#101A2E] truncate">{plan.category}</p>
                </div>
                <div className="p-3 bg-white border border-[#E4E0D8] rounded-xl">
                  <Ruler className="h-4 w-4 text-[#8a6a38] mb-1.5" />
                  <p className="text-[10px] font-mono-label uppercase text-[#55617A]">Tamanho</p>
                  <p className="font-display font-semibold text-[#101A2E]">{plan.squareFeet.toLocaleString()} m²</p>
                </div>
                <div className="p-3 bg-white border border-[#E4E0D8] rounded-xl">
                  <BedDouble className="h-4 w-4 text-[#8a6a38] mb-1.5" />
                  <p className="text-[10px] font-mono-label uppercase text-[#55617A]">Quartos</p>
                  <p className="font-display font-semibold text-[#101A2E]">{plan.bedrooms}</p>
                </div>
                <div className="p-3 bg-white border border-[#E4E0D8] rounded-xl">
                  <Bath className="h-4 w-4 text-[#8a6a38] mb-1.5" />
                  <p className="text-[10px] font-mono-label uppercase text-[#55617A]">Casas de banho</p>
                  <p className="font-display font-semibold text-[#101A2E]">{plan.bathrooms}</p>
                </div>
              </div>

              <div className="pt-5 border-t border-[#E4E0D8] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold text-[#101A2E]">${plan.price}</span>
                  </div>
                  <Badge className="bg-[#3F7A5C]/10 text-[#2f5c46] border border-[#3F7A5C]/30 rounded-full px-3 py-1 font-medium">
                    ● Disponível
                  </Badge>
                </div>

                <div className="[&_button]:rounded-full [&_button]:shadow-lg [&_button]:shadow-[#C79A56]/25 [&_button]:transition-all [&_button]:hover:-translate-y-0.5">
                  <BotaoComprar
                    plantaId={plan.id}
                    arquitetoId={plan.dono}        // campo 'dono' da tabela planta = arquiteto_id
                    nomePlanta={plan.title}
                    preco={plan.price}
                    imagemUrl={plan.image}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Documentos bloqueados */}
          <Card className="border-[#E4E0D8] bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-[#E4E0D8] bg-[#F7F5F1]">
              <CardTitle className="font-display text-lg text-[#101A2E]">Project Documents</CardTitle>
              <CardDescription className="text-[#55617A]">
                Purchase this plan to unlock all documents and detailed specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="divide-y divide-[#E4E0D8] rounded-xl border border-[#E4E0D8] overflow-hidden">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3.5 bg-white hover:bg-[#F7F5F1] transition-colors cursor-not-allowed"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F7F5F1] border border-[#E4E0D8]">
                      <FileText className="h-4 w-4 text-[#8a6a38]" />
                    </div>
                    <span className="text-sm font-medium text-[#101A2E]/70 flex-1 truncate">{doc.name}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono-label uppercase text-[#55617A] bg-[#F7F5F1] border border-[#E4E0D8] rounded-full px-2 py-1">
                      <Lock className="h-3 w-3" />
                      Locked
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#55617A] mt-4 text-center py-2.5 bg-[#F7F5F1] border border-dashed border-[#E4E0D8] rounded-xl">
                🔒 Purchase this plan to unlock all documents
              </p>
            </CardContent>
          </Card>

          {/* ── Comentários reais (substitui os reviews mock) ── */}
          <Card className="border-[#E4E0D8] bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-[#E4E0D8]">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#C79A56]" />
                <CardTitle className="font-display text-lg text-[#101A2E]">Comentários da Comunidade</CardTitle>
              </div>
              <CardDescription className="text-[#55617A]">
                Opiniões de quem já adquiriu este projecto
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {/* O modal só monta ComentariosSection quando está aberto,
                  evitando fetch desnecessário */}
              {open && <ComentariosSection plantaId={plan.id} />}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}