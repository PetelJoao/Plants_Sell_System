"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import DashboardLayout from "@/app/Develop/dashboard/components/dashboard-layout"
import Image from "next/image"
import HousePic from "@/assets/images/Casa.jpeg"
import Porshe from "@/assets/images/Porsche.jpeg"
import { Calendar, Download, FileText, Search } from "lucide-react"
import { useState , useEffect } from "react"
import { useAuth } from "@/Context/AuthContext"


export default function PurchaseHistoryPage() {



const {carregarhistorico , BtnDonwloadPlant } = useAuth() as any
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





  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Histórico De Compras</h1>
          <p className="text-muted-foreground">Vizualize e transfira as plantas arquitetonicas compradas.</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Select defaultValue="all-time">
              <SelectTrigger className="w-[180px]">
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
            <span className="text-sm text-muted-foreground hidden sm:inline">{purchases.length} compras</span>
          </div>
          <div className="w-full sm:w-auto relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search purchases..." className="w-full sm:w-[250px] pl-8" />
          </div>
        </div>

        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-lg">{purchase.id}</CardTitle>
                    <CardDescription>Compradas em {purchase.date}</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    Completas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative aspect-video w-full sm:w-48 rounded-md overflow-hidden">
                    <Image
                      src={(purchase.plan.image) || Porshe}
                      alt={purchase.plan.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{purchase.plan.title}</h3>
                    <p className="text-sm text-muted-foreground">Category: {purchase.plan.category}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Completa completa com todos os documentos</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${purchase.total}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4 bg-muted/50">
                <Button variant="outline" size="sm">
                  Perfil do arquiteto
                </Button>
                <Button size="sm" onClick={() => BtnDonwloadPlant(purchase.plantaId)}>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Ficheiros
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Resumo das compras</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total de plantas compradas</span>
                  <span>{purchases.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Gasto em plantas</span>
                  <span className="font-bold">${purchases.reduce((sum, purchase) => sum + purchase.total, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
