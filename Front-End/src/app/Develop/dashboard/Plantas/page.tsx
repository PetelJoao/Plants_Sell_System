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
import { DollarSign, FileText, Home, MoreHorizontal, Plus, Trash2, Edit, Eye, EyeOff, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {PlanUploadDialog} from "@/app/Develop/dashboard/components/plan-upload-dialog"
import { PlanEditDialog } from "@/components/plan-edit-dialog"
import { RevenueGoalCard } from "@/components/revenue-goal-card"
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
  const  {GerenciarPlantas , MinhasPlantas , deletar , solicitarSaque}  = useAuth() as any
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
      totalUploaded: data.total_plantas      ?? 1,
      sold:          data.plantas_vendidas   ?? 0,
      revenue:       data.saldo_disponivel      ?? 0,
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

  const handlePlanAdded = (newPlan: any) => {
    addPlan(newPlan)
    setPlanStatuses((prev) => ({ ...prev, [newPlan.id]: true }))
    toast({
      title: "Plan Uploaded",
      description: "Your floor plan has been successfully uploaded.",
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
      title: "Plan Updated",
      description: "Your floor plan has been successfully updated.",
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
        title: "Plan Deleted",
        description: "Your floor plan has been permanently deleted.",
      })
      }
      catch (error) {        throw new Error("Falha ao deletar a planta: " + error)
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
      const response = await solicitarSaque();
      const data = response.data;
    }
    catch (error) {
      throw new Error("Falha ao solicitar saque: " + error)
    }
    toast({
      title: "Withdrawal Initiated",
      description: `$${amount.toLocaleString()} will be transferred to ${iban.slice(-4)}... within 2-3 business days.`,
    })

  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Plantas</h2>
          <p className="text-muted-foreground">Acompanhe, gerencie e carregue suas plantas arquitetônicas.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" />
         Carregar Planta
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Todas as suas plantas na plataforma </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div className="text-2xl font-bold">{stats.totalUploaded}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div className="text-2xl font-bold">{stats.sold}</div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Goal Card - Spans 2 columns */}
        <div className="md:col-span-2">
          <RevenueGoalCard
            revenue={stats.revenue}
            onWithdrawClick={() => setWithdrawalOpen(true)}
          />
        </div>

        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-500" />
              <div className="text-2xl font-bold">{stats.active}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-slate-400" />
              <div className="text-2xl font-bold">{stats.inactive}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <Input
                placeholder="Procure a sua planta pelo nome"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              {(["Todas", "ativas", "inativas"] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={statusFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(filter)}
                  className={statusFilter === filter ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Nenhuma planta corresponde a sua pesquisa." : "Nnehuma planta adicionada ainda."}
              </p>
              <Button onClick={() => setUploadOpen(true)} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                Carrega a sua Planta
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="font-semibold">Nome do Projecto</TableHead>
                    <TableHead className="font-semibold">Categoria</TableHead>
                    <TableHead className="font-semibold">Preços</TableHead>
                    <TableHead className="font-semibold">Data que enviada na plataforma</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="text-right font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id} className="border-slate-200">
                      <TableCell className="font-medium">{plan.title}</TableCell>
                      <TableCell>{plan.category}</TableCell>
                      <TableCell>${plan.price}</TableCell>
                      <TableCell>{plan.uploadedAt}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            planStatuses[plan.id] !== false
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }
                        >
                          {planStatuses[plan.id] !== false ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => togglePlanStatus(plan.id)}>
                              {planStatuses[plan.id] !== false ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePlan(plan)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Apagar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Apagar Projecto</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja excluir permanentemente {`"${planToDelete?.title}"`}? esta ação não pode ser desfeita.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
