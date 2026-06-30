"use client"
import { useState } from "react"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Download, Heart, MoreHorizontal, Share2, ShoppingCart,AlertCircle } from "lucide-react"
import Image from "next/image"
import HousePic from "@/assets/images/Casa.jpeg"
import Porshe from "@/assets/images/Porsche.jpeg"
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {filter} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter("All")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Residencial")}>Residencial</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Comercial")}>Comercial</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Multifamiliar")}>Multifamiliar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Casa Pequena")}>Casa Pequena</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Luxo")}>Luxo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-sm text-muted-foreground">{filteredPlans.length} Plantas Disponíveis</span>

        </div>
         {/* <Button onClick={() => setIsUploadDialogOpen(true)}>Adicionar Planta</Button>*/} 
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} 
           className="overflow-hidden cursor-pointer"
            onClick={() => {
            setSelectedPlan(plan)
            setDetailModalOpen(true)
           }}
          >
            <div className="relative aspect-video">
           
            <Image
              
                src={(plan.image) || Porshe}
                alt={plan.title ?? plan.description ?? "Planta arquitectónica"}
                width={500} 
                height={300}
              />

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                 onClick={(e) => {
                 e.stopPropagation()
                 handleAddToOrder(plan)
                 }}
              >
               <ShoppingCart className="h-4 w-4" />
              </Button>
              {plan.featured && <Badge className="absolute top-2 left-2">Featured</Badge>}
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{plan.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReportClick(plan)
                      }}
                      className="text-red-600"
                    >
                      <AlertCircle className="mr-2 h-4 w-4" /> Denunciar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Categoria:</span> {plan.category}
                </div>
                <div>
                  <span className="text-muted-foreground">Tamanho:</span> {plan.squareFeet} m²
                </div>
                <div>
                  <span className="text-muted-foreground">Quartos:</span> {plan.bedrooms}
                </div>
                <div>
                  <span className="text-muted-foreground">Casas de banho:</span> {plan.bathrooms}
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
           </div>
              
            </CardContent>
            <CardFooter className="flex justify-between">
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

