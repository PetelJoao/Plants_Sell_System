"use client"
import { useState } from "react"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Download, Heart, MoreHorizontal, Share2, ShoppingCart, AlertCircle, Ruler, BedDouble, Bath, LayoutGrid } from "lucide-react"
import Image from "next/image"
import HousePic from "@/Assets/images/Casa.jpeg"
import Porshe from "@/Assets/images/Porsche.jpeg"
import { object } from "zod"
import { useToast } from "@/hooks/use-toast"
import { useOrder, type Plan } from "@/Context/order-context" 
import { PlanUploadDialog } from "./plan-upload-dialog"
import { usePlans } from "@/Context/plans-context"
import { PlanDetailModal } from "./plan-detail-modal"
import { BotaoComprar } from "@/components/BotaoComprar"
import { ReportPlanDialog } from "@/components/report-plan-dialog"
import { useAuth } from "@/Context/AuthContext"

export function ArchitecturalPlans() {
const [plans, setPlans] = useState<Plan[]>([]);
const [filter, setFilter] = useState<string>("All");
const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
const [detailModalOpen, setDetailModalOpen] = useState(false)
const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
const [reportDialogOpen, setReportDialogOpen] = useState(false)
 const [planToReport, setPlanToReport] = useState<Plan | null>(null)
const { addToOrder } = useOrder() 
const { toast } = useToast()
 // const { plans, addPlan } = usePlans()
  const { user, loading,  carregar, deletar, AdicionarAoCarrinho } = useAuth() as any

useEffect(() => {
  async function load() {
    const data = await carregar()
    if (!data) {
      toast({ 
        title: "Erro", 
        description: "Não foi possível carregar as plantas.", 
        variant: "destructive",  
      })  
      return  
    } 
    setPlans(data) 
  } 
  load()  
}, [])  
  
  const handlePlanAdded = (newPlan: Plan) => {
    setPlans((prevPlans) => [...prevPlans, newPlan])
  }
   const handleAddToOrder = async (plan: Plan) => {
    try{
      addToOrder(plan)
    toast({
      title: "Adicionado ao Carrinho",
      description: `${plan.title}Foi adicionado com sucesso ao carrinho.`,
      duration: 3000,
    })
      await AdicionarAoCarrinho(plan.id)
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
    }

    
  }
  const handleReportClick = (plan: Plan) => {
    setPlanToReport(plan)
    setReportDialogOpen(true)
  }

  const filteredPlans = filter === "All" ? plans : plans.filter((plan) => plan.category === filter)
  
  return (
    <div className="space-y-8 font-[Inter,sans-serif]">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap");
        .font-display { font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif; }
        .font-mono-label { font-family: "IBM Plex Mono", ui-monospace, monospace; letter-spacing: 0.06em; }
      `}</style>

      {/* Page header */}
      <div className="flex flex-col gap-6">
        <div>
          <p className="font-mono-label text-xs uppercase text-[#8a6a38]">Catálogo</p>
          <h1 className="font-display mt-1 text-2xl sm:text-3xl font-bold text-[#101A2E]">
            Plantas Arquitetónicas
          </h1>
          <p className="mt-1 text-sm text-[#55617A]">
            Explore, compre e organize plantas prontas para o seu próximo projeto.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-xl border-[#E4E0D8] bg-white text-[#101A2E] font-medium hover:bg-[#F7F5F1] hover:border-[#C79A56]/50 focus-visible:ring-2 focus-visible:ring-[#C79A56]/40 transition-all"
                >
                  <LayoutGrid className="mr-2 h-4 w-4 text-[#8a6a38]" />
                  {filter}
                  <ChevronDown className="ml-2 h-4 w-4 text-[#55617A]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-xl border-[#E4E0D8] shadow-lg shadow-[#101A2E]/5">
                <DropdownMenuItem onClick={() => setFilter("All")} className="rounded-lg text-sm">All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("Residencial")} className="rounded-lg text-sm">Residencial</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("Comercial")} className="rounded-lg text-sm">Comercial</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("Multifamiliar")} className="rounded-lg text-sm">Multifamiliar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("Casa Pequena")} className="rounded-lg text-sm">Casa Pequena</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("Luxo")} className="rounded-lg text-sm">Luxo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="font-mono-label text-xs text-[#55617A] bg-[#F7F5F1] border border-[#E4E0D8] rounded-full px-3 py-1.5">
              {filteredPlans.length} PLANTAS DISPONÍVEIS
            </span>
          </div>
           {/* <Button onClick={() => setIsUploadDialogOpen(true)}>Adicionar Planta</Button>*/} 
          </div>
      </div>

      {/* Empty state */}
      {filteredPlans.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-[#E4E0D8] bg-white py-20 px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F5F1] border border-[#E4E0D8]">
            <LayoutGrid className="h-6 w-6 text-[#C79A56]" />
          </div>
          <h3 className="font-display mt-4 text-lg font-semibold text-[#101A2E]">
            Nenhuma planta encontrada
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[#55617A]">
            Não há plantas disponíveis para este filtro no momento. Experimente escolher outra categoria.
          </p>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <Card
            key={plan.id}
            className="group overflow-hidden cursor-pointer rounded-2xl border border-[#E4E0D8] bg-white transition-all hover:shadow-xl hover:shadow-[#101A2E]/8 hover:-translate-y-1"
            onClick={() => {
              setSelectedPlan(plan)
              setDetailModalOpen(true)
            }}
          >
            <div className="relative aspect-video overflow-hidden bg-[#F7F5F1]">
              <Image
                src={(plan.image) || Porshe}
                alt={plan.title ?? plan.description ?? "Planta arquitectónica"}
                width={500}
                height={300}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* base gradient overlay for legibility */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#101A2E]/70 via-[#101A2E]/10 to-transparent" />

              {plan.featured && (
                <Badge className="absolute top-3 left-3 rounded-full border-0 bg-[#C79A56] text-[#101A2E] font-semibold px-3 py-1 shadow-sm">
                  Featured
                </Badge>
              )}

              {plan.category && (
                <span className="absolute bottom-3 left-3 font-mono-label text-[10px] uppercase text-white/90 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-1">
                  {plan.category}
                </span>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-[#C79A56] hover:text-[#101A2E] transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToOrder(plan)
                }}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="font-display text-base font-semibold text-[#101A2E]">
                  {plan.title}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-[#55617A] hover:bg-[#F7F5F1] hover:text-[#101A2E] -mt-1 -mr-1"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl border-[#E4E0D8]">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReportClick(plan)
                      }}
                      className="rounded-lg text-sm text-red-600 focus:text-red-600"
                    >
                      <AlertCircle className="mr-2 h-4 w-4" /> Denunciar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="text-sm text-[#55617A] line-clamp-2">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#F7F5F1] border border-[#E4E0D8] p-3 text-xs text-[#101A2E]">
                <div className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-[#8a6a38]" />
                  <span>{plan.squareFeet} m²</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BedDouble className="h-3.5 w-3.5 text-[#8a6a38]" />
                  <span>{plan.bedrooms}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bath className="h-3.5 w-3.5 text-[#8a6a38]" />
                  <span>{plan.bathrooms}</span>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-3 border-t border-[#E4E0D8]">
              <BotaoComprar
                plantaId={plan.id}
                arquitetoId={plan.dono}        // campo 'dono' da tabela planta = arquiteto_id
                nomePlanta={plan.title}
                preco={plan.price}
                imagemUrl={plan.image}
              /> 
            </CardFooter>
          </Card>
        ))}
      </div>
       <PlanUploadDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} onPlanAdded={handlePlanAdded} />
      {selectedPlan && (
        <PlanDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          plan={selectedPlan}
        />
      )}
            {planToReport && (
        <ReportPlanDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          planTitle={planToReport.title}
          planOwner={planToReport.id || "Arquiteto Desconhecido"}
          reporterName="Utilizador Atual"
        />
      )}

    </div>
  )
}