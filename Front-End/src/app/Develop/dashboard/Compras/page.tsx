"use client"

import { useEffect, useState, useCallback } from "react"
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
import { FileText, Trash2, ShoppingCart, Loader2, RefreshCw, AlertCircle } from "lucide-react"
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

// ── Componente principal ────────────────────────────────────────────────────────
export default function ComprasPage() {
  const { ListarCarrinho, RemoverDoCarrinho, LimparCarrinho, ComprarItem, ComprarTudo } = useAuth() as any
  const { toast } = useToast()

  const [carrinho, setCarrinho] = useState<CarrinhoData | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [limpando, setLimpando] = useState(false)
  const [comprando, setComprando] = useState<string | null>(null)
  const [comprandoTudo, setComprandoTudo] = useState(false)

  // ── Carregar carrinho ────────────────────────────────────────────────────────
  const carregarCarrinho = useCallback(async () => {
    setCarregando(true)
    const data = await ListarCarrinho()
    setCarrinho(data)
    setCarregando(false)
  }, [ListarCarrinho])

  useEffect(() => { carregarCarrinho() }, [carregarCarrinho])

  // ── Remover item ─────────────────────────────────────────────────────────────
  const handleRemover = async (plantaId: string, nomePlanta: string) => {
    setRemovendo(plantaId)
    const resultado = await RemoverDoCarrinho(plantaId)
    if (resultado?.erro) {
      toast({ title: "Erro", description: resultado.erro, variant: "destructive", duration: 3000 })
    } else {
      toast({ title: "Item removido", description: `"${nomePlanta}" foi removido do carrinho.`, duration: 3000 })
      // Actualiza localmente sem re-fetch
      setCarrinho(prev =>
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

  // ── Limpar carrinho ──────────────────────────────────────────────────────────
  const handleLimpar = async () => {
    if (!carrinho?.itens.length) return
    setLimpando(true)
    const resultado = await LimparCarrinho()
    if (resultado?.erro) {
      toast({ title: "Erro", description: resultado.erro, variant: "destructive", duration: 3000 })
    } else {
      toast({ title: "Carrinho limpo", description: "Todos os itens foram removidos.", duration: 3000 })
      setCarrinho(prev => prev ? { ...prev, itens: [], total_itens: 0, valor_total: 0 } : prev)
    }
    setLimpando(false)
  }

  // ── Comprar item individual ──────────────────────────────────────────────────
  const handleComprarItem = async (plantaId: string, nomePlanta: string) => {
    setComprando(plantaId)
    toast({ title: "A processar...", description: `A iniciar compra de "${nomePlanta}".`, duration: 2000 })
    const resultado = await ComprarItem(plantaId)
    if (resultado?.erro) {
      toast({ title: "Erro no checkout", description: resultado.erro, variant: "destructive", duration: 4000 })
      setComprando(null)
    }
    // Se bem-sucedido, ComprarItem redireciona → não precisamos de limpar estado
  }

  // ── Comprar tudo ─────────────────────────────────────────────────────────────
  const handleComprarTudo = async () => {
    if (!carrinho?.itens.length) return
    setComprandoTudo(true)
    toast({
      title: "A processar...",
      description: `A iniciar checkout de ${carrinho.total_itens} item(ns).`,
      duration: 2000,
    })
    const resultado = await ComprarTudo()
    if (resultado?.erro) {
      toast({ title: "Erro no checkout", description: resultado.erro, variant: "destructive", duration: 4000 })
      setComprandoTudo(false)
    }
    // Se bem-sucedido, ComprarTudo redireciona → não precisamos de limpar estado
  }

  // ── Estados de UI ─────────────────────────────────────────────────────────────
  if (carregando) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-muted-foreground">A carregar o carrinho…</span>
        </div>
      </DashboardLayout>
    )
  }

  if (!carrinho) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-muted-foreground">Não foi possível carregar o carrinho.</p>
          <Button variant="outline" onClick={carregarCarrinho}>
            <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const itens = carrinho.itens
  const totalItens = carrinho.total_itens
  const valorTotal = carrinho.valor_total

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Carrinho</h1>
            <p className="text-muted-foreground">Veja e gerencie os itens do seu carrinho.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={carregarCarrinho} disabled={carregando}>
              <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
            </Button>
            {itens.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={handleLimpar}
                disabled={limpando}
              >
                {limpando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Limpar tudo
              </Button>
            )}
          </div>
        </div>

        {/* Carrinho vazio */}
        {itens.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-slate-50/50">
            <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium">O seu carrinho está vazio</h3>
            <p className="text-muted-foreground mt-1">Adicione plantas no painel para começar.</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Lista de itens */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {totalItens} {totalItens === 1 ? "item" : "itens"} no carrinho
              </h2>

              {itens.map((item) => {
                const planta = item.planta
                const estaRemovendo = removendo === planta.id
                const estaComprando = comprando === planta.id

                return (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row gap-4">

                        {/* Imagem */}
                        <div className="relative aspect-video w-full sm:w-40 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                          {planta.imagens?.[0] ? (
                            <Image
                              src={planta.imagens[0]}
                              alt={planta.nome}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <FileText className="h-8 w-8" />
                            </div>
                          )}
                        </div>

                        {/* Detalhes */}
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold text-base">{planta.nome}</h3>
                            {planta.arquiteto?.usuario?.nome && (
                              <p className="text-sm text-muted-foreground">
                                Arquiteto: {planta.arquiteto.usuario.nome}
                              </p>
                            )}
                            {planta.descricao && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {planta.descricao}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>Planta completa com todos os documentos</span>
                          </div>

                          {/* Preço + Acções */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="font-bold text-lg">
                              {planta.orcamento > 0 ? `$${planta.orcamento.toFixed(2)}` : "Preço não definido"}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemover(planta.id, planta.nome)}
                                disabled={estaRemovendo || estaComprando || comprandoTudo}
                              >
                                {estaRemovendo
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Trash2 className="h-4 w-4" />
                                }
                              </Button>
                              <Button
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600"
                                onClick={() => handleComprarItem(planta.id, planta.nome)}
                                disabled={estaComprando || estaRemovendo || comprandoTudo || planta.orcamento <= 0}
                              >
                                {estaComprando
                                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  : <ShoppingCart className="mr-2 h-4 w-4" />
                                }
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

            {/* Resumo do pedido */}
            <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead className="text-left font-semibold">Item</TableHead>
                        <TableHead className="text-right font-semibold">Preço</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itens.map((item) => (
                        <TableRow key={item.id} className="border-slate-100">
                          <TableCell className="text-left py-3">{item.planta.nome}</TableCell>
                          <TableCell className="text-right py-3 font-medium">
                            {item.planta.orcamento > 0 ? `$${item.planta.orcamento.toFixed(2)}` : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 border-slate-300 bg-slate-50/50">
                        <TableCell className="py-3 font-semibold">
                          Total ({totalItens} {totalItens === 1 ? "item" : "itens"})
                        </TableCell>
                        <TableCell className="text-right py-3 text-lg font-bold">
                          ${valorTotal.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  size="lg"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  onClick={handleComprarTudo}
                  disabled={comprandoTudo || valorTotal <= 0}
                >
                  {comprandoTudo
                    ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    : <ShoppingCart className="mr-2 h-5 w-5" />
                  }
                  {comprandoTudo ? "A processar…" : "Comprar Tudo"}
                </Button>
              </CardFooter>
            </Card>

          </div>
        )}
      </div>
    </DashboardLayout>
  )
}