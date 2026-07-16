'use client'

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import DashboardLayout from "@/app/Develop/dashboard/components/dashboard-layout"
import Image from "next/image"
import { FileText, Trash2, ShoppingCart, Loader2, RefreshCw, AlertCircle, ArrowRight } from "lucide-react"
import { useAuth } from "@/Context/AuthContext"
import { useToast } from "@/hooks/use-toast"

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface PlantaItem {
  id: string
  nome: string
  descricao?: string
  orcamento: number
  imagens?: string[]
  dono: string
  arquiteto?: { id: string; usuario?: { nome: string } }
}

interface CarrinhoItem {
  id: string
  adicionado_em: string
  planta_id?: string
  planta: PlantaItem
}

interface CarrinhoData {
  carrinho_id: string
  total_itens: number
  valor_total: number
  itens: CarrinhoItem[]
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function ComprasPage() {
  const { ListarCarrinho, RemoverDoCarrinho, LimparCarrinho, ComprarItem, ComprarTudo } = useAuth() as any
  const { toast } = useToast()
  const router = useRouter()

  const [carrinho, setCarrinho] = useState<CarrinhoData | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [limpando, setLimpando] = useState(false)
  const [comprando, setComprando] = useState<string | null>(null)
  const [comprandoTudo, setComprandoTudo] = useState(false)

  const carregarCarrinho = useCallback(async () => {
    setCarregando(true)
    const data = await ListarCarrinho()
    setCarrinho(data)
    setCarregando(false)
  }, [ListarCarrinho])

  useEffect(() => { carregarCarrinho() }, [carregarCarrinho])

  const handleRemover = async (plantaId: string, nomePlanta: string) => {
    setRemovendo(plantaId)
    const resultado = await RemoverDoCarrinho(plantaId)
    if (resultado?.erro) {
      toast({ title: "Erro", description: resultado.erro, variant: "destructive", duration: 3000 })
    } else {
      toast({ title: "Item removido", description: `"${nomePlanta}" foi removido do carrinho.`, duration: 3000 })
      // Tipagem explícita para evitar erro de 'implicit any'
      setCarrinho((prev: CarrinhoData | null) =>
        prev
          ? {
              ...prev,
              itens: prev.itens.filter(i => i.planta.id !== plantaId),
              total_itens: prev.total_itens - 1,
              valor_total: +(prev.valor_total - (prev.itens.find(i => i.planta.id === plantaId)?.planta.orcamento ?? 0)).toFixed(2),
            }
          : prev
      )
    }
    setRemovendo(null)
  }

  const handleLimpar = async () => {
    if (!carrinho?.itens.length) return
    setLimpando(true)
    const resultado = await LimparCarrinho()
    if (resultado?.erro) {
      toast({ title: "Erro", description: resultado.erro, variant: "destructive", duration: 3000 })
    } else {
      toast({ title: "Carrinho limpo", description: "Todos os itens foram removidos.", duration: 3000 })
      setCarrinho((prev: CarrinhoData | null) => prev ? { ...prev, itens: [], total_itens: 0, valor_total: 0 } : prev)
    }
    setLimpando(false)
  }

  const handleComprarItem = async (plantaId: string, nomePlanta: string) => {
    setComprando(plantaId)
    const resultado = await ComprarItem(plantaId)
    if (resultado?.erro) {
      toast({ title: "Erro no checkout", description: resultado.erro, variant: "destructive", duration: 4000 })
      setComprando(null)
      return
    }
    const checkoutUrl = resultado?.checkout_url
    if (checkoutUrl) window.location.href = checkoutUrl
    else {
      toast({ title: "Erro", description: "Não foi possível obter o link.", variant: "destructive", duration: 4000 })
      setComprando(null)
    }
  }

  const handleComprarTudo = async () => {
    if (!carrinho?.itens.length) return
    setComprandoTudo(true)
    const resultado = await ComprarTudo()
    if (resultado?.erro) {
      toast({ title: "Erro no checkout", description: resultado.erro, variant: "destructive", duration: 4000 })
      setComprandoTudo(false)
      return
    }
    const sessoes: { checkout_url: string; session_id: string }[] = resultado?.sessoes ?? []
    if (sessoes.length === 0) {
      toast({ title: "Erro", description: "Nenhuma sessão criada.", variant: "destructive", duration: 4000 })
      setComprandoTudo(false)
      return
    }
    if (sessoes.length === 1) window.location.href = sessoes[0].checkout_url
    else {
      const [primeira, ...restantes] = sessoes
      if (restantes.length > 0) sessionStorage.setItem("checkout_queue", JSON.stringify(restantes.map(s => s.checkout_url)))
      window.location.href = primeira.checkout_url
    }
  }

  // Estados de Carregamento/Erro
  if (carregando && !carrinho) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-slate-500 font-medium">A carregar o seu carrinho...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8 max-w-5xl mx-auto">
        
     
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Carrinho</h1>
            <p className="text-slate-500 mt-1">Gestão de itens e checkout de plantas.</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={carregarCarrinho} disabled={carregando} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
            {carrinho?.itens && carrinho.itens.length > 0 && (
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 gap-2" onClick={handleLimpar} disabled={limpando}>
                {limpando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Limpar
              </Button>
            )}
          </div>
        </div>

 
        {!carrinho || carrinho.itens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-white shadow-sm transition-all hover:border-blue-200">
            <div className="h-20 w-20 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-6">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">O seu carrinho está vazio</h3>
            <p className="text-slate-500 text-center max-w-sm mb-8 leading-relaxed">
              Ainda não adicionou plantas ao seu carrinho. Explore o nosso catálogo para encontrar a planta perfeita para o seu projeto.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
              Explorar Plantas <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {carrinho.total_itens} {carrinho.total_itens === 1 ? "item" : "itens"} no carrinho
              </h2>

              {carrinho.itens.map((item) => {
                const planta = item.planta
                const estaRemovendo = removendo === planta.id
                const estaComprando = comprando === planta.id

                return (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative aspect-video w-full sm:w-40 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                          {planta.imagens?.[0] ? (
                            <Image src={planta.imagens[0]} alt={planta.nome} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <FileText className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold text-base">{planta.nome}</h3>
                            {planta.arquiteto?.usuario?.nome && (
                              <p className="text-sm text-slate-500">Arquiteto: {planta.arquiteto.usuario.nome}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <div className="font-bold text-lg">${planta.orcamento.toFixed(2)}</div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleRemover(planta.id, planta.nome)} disabled={estaRemovendo || estaComprando || comprandoTudo}>
                                {estaRemovendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleComprarItem(planta.id, planta.nome)} disabled={estaComprando || estaRemovendo || comprandoTudo}>
                                {estaComprando ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
                                Comprar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

           
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader><CardTitle className="text-lg">Resumo do Pedido</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {carrinho.itens.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.planta.nome}</TableCell>
                        <TableCell className="text-right">${item.planta.orcamento.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 border-slate-900/10">
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold text-lg">${carrinho.valor_total.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleComprarTudo} disabled={comprandoTudo || carrinho.valor_total <= 0}>
                  {comprandoTudo ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                  Comprar Tudo
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}