"use client"
import { useState, useMemo , useEffect} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// Ícones adicionados para melhorar a semântica visual (Search, Wallet, etc)
import { DollarSign, FileText, Home, MoreHorizontal, Plus, Trash2, Edit, Eye, EyeOff, TrendingUp, Search, Wallet, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PlanUploadDialog } from "@/app/Develop/dashboard/components/plan-upload-dialog"
import { PlanEditDialog } from "@/components/plan-edit-dialog"
import { RevenueGoalCard } from "@/components/revenue-goal-card" // Mantido na importação, mas a UI foi inlinada para permitir a customização profunda solicitada
import { WithdrawalModal } from "@/components/withdrawal-modal"
import DashboardLayout from "@/app/Develop/dashboard/components/dashboard-layout"
import { usePlans, type ArchitectPlan } from "@/Context/plans-context"
import { useAuth } from "@/Context/AuthContext"

export default function PlansPage() {
  const { toast } = useToast()
  const { addPlan, updatePlan, deletePlan } = usePlans()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [plans , setPlans] = useState<ArchitectPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<ArchitectPlan | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"Todas" | "ativas" | "inativas">("Todas")
  const [planToDelete, setPlanToDelete] = useState<ArchitectPlan | null>(null)
  const [planStatuses, setPlanStatuses] = useState<Record<number, boolean>>(
    Object.fromEntries(plans.map((p) => [p.id, true]))
  )
  const [withdrawalOpen, setWithdrawalOpen] = useState(false)
  const  {GerenciarPlantas , MinhasPlantas , deletar , solicitarSaque , loading}  = useAuth() as any
  const [stats, setStats] = useState({
    totalUploaded: 0,
    sold: 0,
    revenue: 0,
    active: 0,
    inactive: 0,
  })

  // Filter and search plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch = plan.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const isActive = planStatuses[plan.id] !== false
      const matchesStatus =
        statusFilter === "Todas" || (statusFilter === "ativas" && isActive) || (statusFilter === "inativas" && !isActive)
      return matchesSearch && matchesStatus
    })
  }, [plans, searchQuery, statusFilter, planStatuses])

  useEffect(() => {
    
    const LoadPlansStatuses = async () => {
      try {
        const data = await GerenciarPlantas()
        const myPlans = await MinhasPlantas()
        setPlans(myPlans)
        setStats({
      totalUploaded: data.total_plantas      ?? 0,
      sold:          data.plantas_vendidas   ?? 0,
      revenue:       data.saldo_disponivel     || 0,
      active:        data.plantas_ativas     ?? 0,
      inactive:      data.plantas_inativas   ?? 0,
    });

      }
      catch (error) {
        throw new Error("Falha ao carregar os estados das plantas: " + error)
      }

    }
    LoadPlansStatuses()
    
  }, [])

const minimoSaque = 200;
const podeSacar = stats.revenue >= minimoSaque;

const handleRetirarFundos = async () => {
  if (!podeSacar) return;

  const response = await solicitarSaque(stats.revenue)
  if (!response) {
    toast({
      title: "Erro ao solicitar saque",
      description: "Não foi possível processar o pedido. Verifica se já tens um saque pendente.",
      variant: "destructive",
    })
    return
  }
  toast({
    title: "Saque solicitado",
    description: "O seu dinheiro será enviado em 2 a 3 dias úteis.",
  })
}

  const handlePlanAdded = (newPlan: any) => {
    addPlan(newPlan)
    setPlanStatuses((prev) => ({ ...prev, [newPlan.id]: true }))
    toast({
      title: "Plano carregado",
      description: "Sua planta foi carregada com sucesso.",
    })
  }

  const handleEditPlan = (plan: ArchitectPlan) => {
    setSelectedPlan(plan)
    setEditOpen(true)
  }

  const handleSaveEdit = (updatedPlan: ArchitectPlan) => {
    updatePlan(updatedPlan.id, updatedPlan)
    setEditOpen(false)
    toast({
      title: "Plano atualizado",
      description: "Sua planta foi atualizada com sucesso.",
    })
  }

  const handleDeletePlan = (plan: ArchitectPlan) => {
    setPlanToDelete(plan)
  }

  const confirmDelete = async () => {
    if (planToDelete) {

      try{
        await deletar(planToDelete.id)
      
        deletePlan(planToDelete.id)
      setPlanStatuses((prev) => {
        const newStatuses = { ...prev }
        delete newStatuses[planToDelete.id]
        return newStatuses
  
      })
      toast({
        title: "Plano excluído",
        description: "Sua planta foi excluída permanentemente.",
      })
      }
      catch (error) {throw new Error("Falha ao deletar a planta: " + error)
      }
      setPlanToDelete(null)
    }
  }

  const togglePlanStatus = (planId: number) => {
    setPlanStatuses((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }))
    const plan = plans.find((p) => p.id === planId)
    const newStatus = !planStatuses[planId]
    toast({
      title: `Plan ${newStatus ? "Activated" : "Deactivated"}`,
      description: `${plan?.title} is now ${newStatus ? "active" : "inactive"}.`,
    })
  }

  const handleWithdrawalConfirm = async(amount: number, iban: string) => {
    try {
      const response = await solicitarSaque(amount);
      const data = response.data;
    }
    catch (error) {
      throw new Error("Falha ao solicitar saque: " + error)
    }
    toast({
      title: "Saque iniciada",
      description: `$${amount.toLocaleString()} será transferido para ${iban.slice(-4)}... Em 2 a 3 dias úteis.`,
    })

  }

  // Goal calculation for inline revenue card
  const revenueGoal = 1000;
  const revenueProgress = Math.min((stats.revenue / revenueGoal) * 100, 100);
  const remainingForElite = Math.max(revenueGoal - stats.revenue, 0);

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-6 md:p-8 max-w-[1600px] mx-auto w-full bg-[#fcfcfd] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Gestão de Plantas</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Acompanhe, gerencie e carregue suas plantas arquitetônicas.</p>
        </div>
        <Button 
          onClick={() => setUploadOpen(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-full px-6 py-5"
        >
          <Plus className="mr-2 h-5 w-5" />
          Carregar Planta
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        
        {/* Card: Total */}
        <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total de Plantas</p>
                <div className="text-2xl font-black text-slate-900">{stats.totalUploaded}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Vendidas */}
        <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Vendidas</p>
                <div className="text-2xl font-black text-slate-900">{stats.sold}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Goal Card (Redesenhado Inline) - Spans 2 columns */}
        <Card className="col-span-2 relative overflow-hidden border-blue-200 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl">
          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-32 h-32 bg-blue-600 opacity-[0.03] rounded-full blur-3xl"></div>
          
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-bold tracking-wide uppercase text-blue-800/70 mb-1">Receita Disponível</p>
                <h3 className="text-4xl font-black text-blue-950 flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-600/80 mr-1" />
                  {stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <Button 
            onClick={handleRetirarFundos}
            disabled={!podeSacar}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors rounded-xl px-5 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Retirar fundos
          </Button>
            </div>
            
            {/* Progress Bar Redesigned */}
            <div className="mt-2">
              <div className="flex justify-between text-xs font-semibold text-blue-800/60 mb-2 px-1">
                <span>$200 min.</span>
                <span className="text-blue-700">Meta: ${revenueGoal.toLocaleString()}</span>
              </div>
              <div className="h-3 w-full bg-blue-200/50 rounded-full overflow-hidden relative">
                {/* Marker for $200 min withdrawal */}
                <div className="absolute top-0 bottom-0 left-[20%] w-[2px] bg-blue-300/80 z-10"></div>
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${revenueProgress}%` }}
                />
              </div>
              <p className="text-sm font-medium text-blue-800/80 mt-3 text-center">
                Apenas <span className="font-bold text-blue-700">${remainingForElite.toLocaleString()}</span> para alcançar o <strong className="text-blue-900">status de elite</strong> 🚀
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card: Ativas & Inativas Wrapper para Mobile (Agrupamento) */}
        <div className="grid grid-cols-2 gap-5 col-span-2 lg:col-span-4 xl:col-span-1 xl:flex xl:flex-col">
          {/* Card: Ativas */}
          <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl flex-1">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Ativas</p>
                  <div className="text-2xl font-black text-slate-900">{stats.active}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Inativas */}
          <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl flex-1">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 text-slate-500 rounded-xl">
                  <EyeOff className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Inativas</p>
                  <div className="text-2xl font-black text-slate-900">{stats.inactive}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters (Redesigned as Segmented Control & Clean Input) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md ml-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Procure a sua planta pelo nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-0 bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:bg-white rounded-xl h-11 text-base transition-all"
          />
        </div>
        
        {/* Segmented Control */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl mr-1">
          {(["Todas", "ativas", "inativas"] as const).map((filter) => {
            const isActive = statusFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/50" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Plans Table */}
      <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {filteredPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <FileText className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">
                {searchQuery ? "Nenhum resultado encontrado" : "Sua biblioteca está vazia"}
              </h3>
              <p className="text-slate-500 mb-6 max-w-sm">
                {searchQuery ? "Tente ajustar os filtros ou os termos da sua pesquisa." : "Comece adicionando sua primeira planta arquitetônica para gerenciar seu portfólio."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setUploadOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-full px-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Carregar sua primeira Planta
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 py-5 pl-6">Nome do Projecto</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Categoria</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Preço</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Data de Envio</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Estado</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 text-right pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => {
                    const isPlanActive = planStatuses[plan.id] !== false;
                    return (
                      <TableRow key={plan.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
                        <TableCell className="font-semibold text-slate-900 py-4 pl-6">{plan.title}</TableCell>
                        <TableCell className="text-slate-600">{plan.category}</TableCell>
                        <TableCell className="font-medium text-slate-900">${plan.price}</TableCell>
                        <TableCell className="text-slate-500">{plan.uploadedAt}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border-0 ${
                              isPlanActive
                                ? "bg-emerald-100/80 text-emerald-700"
                                : "bg-rose-100/80 text-rose-700"
                            }`}
                          >
                            {isPlanActive ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-200 shadow-lg">
                              <DropdownMenuItem onClick={() => togglePlanStatus(plan.id)} className="cursor-pointer font-medium py-2">
                                {isPlanActive ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4 text-slate-500" />
                                    <span className="text-slate-700">Desativar</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4 text-emerald-500" />
                                    <span className="text-emerald-700">Ativar</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditPlan(plan)} className="cursor-pointer font-medium py-2">
                                <Edit className="mr-2 h-4 w-4 text-blue-500" />
                                <span className="text-slate-700">Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeletePlan(plan)}
                                className="cursor-pointer font-medium py-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50 mt-1"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Apagar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogTitle className="text-xl text-slate-900">Apagar Projecto</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-slate-500">
            Tem certeza de que deseja excluir permanentemente <span className="font-bold text-slate-900">"{planToDelete?.title}"</span>? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel className="rounded-xl font-semibold">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-semibold"
            >
              Apagar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogs */}
      <PlanUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onPlanAdded={handlePlanAdded} />
      {selectedPlan && (
        <PlanEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          plan={selectedPlan}
          onSave={handleSaveEdit}
        />
      )}
      <WithdrawalModal
        open={withdrawalOpen}
        onOpenChange={setWithdrawalOpen}
        availableAmount={stats.revenue}
        onConfirm={handleWithdrawalConfirm}
      />
      </div>
    </DashboardLayout>
  )
}