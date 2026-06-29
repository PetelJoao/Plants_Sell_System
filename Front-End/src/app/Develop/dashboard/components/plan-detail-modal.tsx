// components/PlanDetailModal.tsx
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Lock, X, MessageSquare, ShieldCheck, Trash2 } from "lucide-react"
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
    return <p className="text-sm text-muted-foreground py-4">A carregar comentários...</p>
  }

  return (
    <div className="space-y-5">
      {/* Formulário — só para compradores verificados */}
      {podeComentar ? (
        <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            Compra verificada — pode comentar publicamente
          </div>
          <Textarea
            rows={3}
            placeholder="Partilhe a sua experiência com este projecto..."
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            maxLength={1000}
            className="bg-white"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{conteudo.length}/1000</span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || conteudo.trim().length < 3}
            >
              {submitting ? "A publicar..." : "Publicar comentário"}
            </Button>
          </div>
        </div>
      ) : (
        // Mensagem subtil se não comprou (só aparece se estiver logado)
        user && (
          <p className="text-xs text-muted-foreground italic">
            Apenas compradores verificados podem comentar neste projecto.
          </p>
        )
      )}

      {/* Lista */}
      {comentarios.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-4">
          Ainda não há comentários. Seja o primeiro a partilhar a sua experiência.
        </p>
      ) : (
        <div className="space-y-3">
          {comentarios.map((c) => (
            <div key={c.id} className="flex gap-3 pb-4 border-b last:border-b-0">
              {/* Avatar inicial */}
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                {c.nome_autor.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{c.nome_autor}</span>
                      <Badge variant="outline" className="text-[10px] border-green-400 text-green-700 py-0">
                        Comprador verificado
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
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
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      title="Apagar comentário"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-700 mt-1.5 leading-relaxed whitespace-pre-wrap">
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
          <DialogTitle className="text-2xl">{plan.title}</DialogTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Galeria */}
            <div className="lg:col-span-1 space-y-3">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100">
                <Image src={selectedImage} alt={plan.title} fill className="object-cover" />
              </div>
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Ver imagem ${idx + 1}`}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === img ? "border-blue-500" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-4">{plan.title}</h1>
                <div className="flex items-center gap-3 mb-4">
                  {plan.architectImage && (
                    <Image src={plan.architectImage} alt={plan.architect || "Architect"} width={40} height={40} className="rounded-full" />
                  )}
                  <div>
                    <p className="font-semibold text-sm">{plan.architect || "Architect"}</p>
                    <p className="text-xs text-muted-foreground">Uploaded {plan.uploadedAt || "Recently"}</p>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">{plan.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p>
                  <p className="font-semibold">{plan.category}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Size</p>
                  <p className="font-semibold">{plan.squareFeet.toLocaleString()} sq ft</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Bedrooms</p>
                  <p className="font-semibold">{plan.bedrooms}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Bathrooms</p>
                  <p className="font-semibold">{plan.bathrooms}</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Available</Badge>
                </div>
                <BotaoComprar
                  plantaId={plan.id}
                  arquitetoId={plan.dono}
                  nomePlanta={plan.title}
                  preco={plan.price}
                  imagemUrl={plan.image}
                />
              </div>
            </div>
          </div>

          {/* Documentos bloqueados */}
          <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg">Project Documents</CardTitle>
              <CardDescription>Purchase this plan to unlock all documents and detailed specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 opacity-75 cursor-not-allowed">
                    <Lock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-600 flex-1 truncate">{doc.name}</span>
                    <span className="text-xs text-slate-400">Locked</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-600 mt-4 text-center py-2 bg-slate-50 rounded-lg">
                🔒 Purchase this plan to unlock all documents
              </p>
            </CardContent>
          </Card>

          {/* ── Comentários reais (substitui os reviews mock) ── */}
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Comentários da Comunidade</CardTitle>
              </div>
              <CardDescription>
                Opiniões de quem já adquiriu este projecto
              </CardDescription>
            </CardHeader>
            <CardContent>
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