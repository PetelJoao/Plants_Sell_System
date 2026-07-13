"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/app/Develop/dashboard/components/dashboard-layout"
import Image from "next/image"
import Porshe from "@/assets/images/Porsche.jpeg"
import {
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Search,
  Wallet,
  PackageOpen,
  Hash,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/Context/AuthContext"

export default function PurchaseHistoryPage() {
  const { carregarhistorico, BtnDonwloadPlant } = useAuth() as any
  const [purchases, setPurchases] = useState<any[]>([])

  useEffect(() => {
    const TodasAsCompras = async () => {
      try {
        const response = await carregarhistorico()

        const mappedPurchases = response.compras.map((purchases: any) => ({
          id: purchases.compra_id,
          date: new Date(purchases.comprado_em).toLocaleDateString("pt-PT", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          plan: {
            title: purchases.planta_nome,
            image: purchases.imagens?.[0] ?? null,
            category: purchases.categoria,
          },
          total: purchases.valor,
          downloadCount: purchases.download_count ?? 0,
          lastDownloaded: purchases.updated_at
            ? new Date(purchases.updated_at).toLocaleDateString("pt-PT", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : null,
          plantaId: purchases.planta_id,
        }))
        setPurchases(mappedPurchases)

        console.log(mappedPurchases)
      } catch (error) {
        console.error("Erro ao carregar histórico:", error)
      }
    }

    TodasAsCompras()
  }, [])

  // Presentation-only helper: shorten a UUID to a friendly order reference.
  const shortOrderRef = (id: string) => {
    if (!id) return "—"
    return id.length > 8 ? id.slice(0, 8) : id
  }

  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total, 0)

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Histórico De Compras</h1>
          <p className="text-muted-foreground">Vizualize e transfira as plantas arquitetonicas compradas.</p>
        </div>

        {/* Filter + search bar, styled to match the rest of the dashboard */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Select defaultValue="all-time">
              <SelectTrigger className="w-[180px] rounded-lg border-border bg-background shadow-sm">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">Todas</SelectItem>
                <SelectItem value="this-year">Esse Ano</SelectItem>
                <SelectItem value="last-year">último Ano</SelectItem>
                <SelectItem value="last-6-months">Últimos 6 meses</SelectItem>
                <SelectItem value="last-30-days">Últimos 30 Dias</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {purchases.length} {purchases.length === 1 ? "compra" : "compras"}
            </span>
          </div>
          <div className="w-full sm:w-auto relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Procurar compras..."
              className="w-full sm:w-[250px] pl-8 rounded-lg border-border bg-background shadow-sm"
            />
          </div>
        </div>

        {/* Purchase list */}
        {purchases.length > 0 ? (
          <div className="flex flex-col gap-5">
            {purchases.map((purchase) => (
              <Card
                key={purchase.id}
                className="overflow-hidden rounded-xl border-border/60 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span
                        className="inline-flex items-center gap-1 font-medium tracking-wide"
                        title={`ID completo: ${purchase.id}`}
                      >
                        <Hash className="h-3 w-3" />
                        Pedido #{shortOrderRef(purchase.id)}
                      </span>
                      <span className="text-border">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {purchase.date}
                      </span>
                    </div>
                    <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completas
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative aspect-video w-full sm:w-48 shrink-0 rounded-lg overflow-hidden ring-1 ring-border/50">
                      <Image
                        src={purchase.plan.image || Porshe}
                        alt={purchase.plan.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between gap-2">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold leading-tight">{purchase.plan.title}</h3>
                          <Badge variant="secondary" className="font-normal">
                            {purchase.plan.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span>Compra completa com todos os documentos</span>
                        </div>
                      </div>
                    </div>
                    <div className="sm:text-right sm:pl-4 sm:border-l sm:border-border/60 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end shrink-0">
                      <span className="text-xs text-muted-foreground sm:mb-1">Valor pago</span>
                      <span className="text-2xl font-bold tracking-tight">${purchase.total}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between gap-3 border-t border-border/60 pt-4 bg-muted/30">
                  <Button variant="outline" size="sm" className="font-medium">
                    Perfil do arquiteto
                  </Button>
                  <Button
                    size="sm"
                    className="font-medium shadow-sm"
                    onClick={() => BtnDonwloadPlant(purchase.plantaId)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Ficheiros
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          // Empty state, following the platform's standard pattern
          <Card className="rounded-xl border-dashed border-border/70 shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <PackageOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">Ainda não tem compras</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  As plantas arquitetonicas que comprar vão aparecer aqui, prontas para consultar e transferir.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary card, redesigned as two KPI blocks */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Resumo das compras</h2>
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
                <div className="flex items-center gap-4 p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de plantas compradas</p>
                    <p className="text-3xl font-bold tracking-tight">{purchases.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
                    <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total gasto em plantas</p>
                    <p className="text-3xl font-bold tracking-tight">${totalSpent}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}