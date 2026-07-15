"use client"

import { useState, useMemo , useEffect} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/Context/AuthContext";

interface Report {
  id: number
  Nome_denuncia: string
  Denunciador_avatar: string
  Denunciado: string
  Tipo_denuncia: string
  categoria: string
  descricao: string
  data: string
  estado: "Aberto" | "Sob Revisão" | "Resolvido"
  notas?: string
}

const initialReports: Report[] = [
  {
    id: 1,
    Nome_denuncia: "Alice Johnson",
    Denunciador_avatar: "AJ",
    Denunciado: "Suspicious User #123",
    Tipo_denuncia: "Usuario",
    categoria: "Fraude",
    descricao:
      "Este usuário está vendendo plantas arquitetônicas falsas com marcas d'água. Vários clientes reclamaram da qualidade.",
    data: "2024-03-12",
    estado: "Aberto",
  },
]

export default function ReportsPage() {
  const { toast } = useToast()
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Aberto" | "Sob Revisão" | "Resolvido">(
    "Todos"
  )
  const [categoryFilter, setCategoryFilter] = useState<string>("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const { carregarDenuncias } = useAuth() as any

  const categories = ["Todos", "Conteúdo Inapropriado", "Fraude", "Spam", "Outro"]
  
  useEffect(() => {
   const LoadReports = async () => 
    {
      try 
      {
        const response = await carregarDenuncias();
        if (response && Array.isArray(response)) 
        {
        
          const Mapped = response.map((item:any) => ({
            id: item.id,
            Nome_denuncia: item.nome ??  '',
            Denunciador_avatar: item.Denunciador_avatar ?? ' ',
            Denunciado: item.id_planta,
            Tipo_denuncia: item.Tipo_denuncia ?? '',
            categoria: item.categoria,
            descricao: item.descricao ?? '',
            data: item.data_registro ?? '',
            estado: item.estado ?? 'Aberto',
            notas: item.notas ?? "",
          }))
          setReports(Mapped)
          console.log("Reports loaded:", Mapped)
        } else {
          console.error("Failed to fetch reports:", response.statusText)
        }

      }
      catch (error) 
      {
        console.error("Error fetching reports:", error)
      }

    }
    LoadReports()

   }
  , [])
 const filteredReports = useMemo(() => {
  return reports.filter((report) => {
  
    const nomeDenuncia = String(report.Nome_denuncia || "").toLowerCase();
    const denunciadoCod = String(report.Denunciado || "").toLowerCase();
    const termoBusca = searchQuery.toLowerCase();

    const matchesSearch = nomeDenuncia.includes(termoBusca) || denunciadoCod.includes(termoBusca);

   
    const estadoReport = String(report.estado || "").toLowerCase();
    const estadoFiltro = statusFilter.toLowerCase();
    
    const matchesStatus = 
      statusFilter === "Todos" || 
      estadoReport === estadoFiltro ||
      (estadoFiltro.startsWith("aber") && estadoReport.startsWith("aber"));

    const matchesCategory = categoryFilter === "Todos" || report.categoria === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });
}, [reports, searchQuery, statusFilter, categoryFilter]);

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report)
    setAdminNotes(report.notas || "")
    setDetailOpen(true)
  }

  const handleStatusChange = (newStatus: Report["estado"]) => {
    if (selectedReport) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id ? { ...r, status: newStatus, notes: adminNotes } : r
        )
      )
      setSelectedReport((prev) => (prev ? { ...prev, status: newStatus, notes: adminNotes } : null))
      toast({
        title: "Denúncia Atualizada",
        description: `Estado da Denúnicia atualizado para ${newStatus}.`,
      })
    }
  }

  const getStatusColor = (status: Report["estado"]) => {
    switch (status) {
      case "Aberto":
        return "bg-red-50 text-red-700 border-red-200"
      case "Sob Revisão":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Resolvido":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciador de Denúncias</h1>
        <p className="text-muted-foreground">Analisar e gerenciar as reclamações dos usuários.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar por nome do denunciador ou do denunciado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-2">
                {(["Todos", "Aberto", "Sob Revisão", "Resolvido"] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={statusFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(filter)}
                    className={statusFilter === filter ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(category)}
                    className={categoryFilter === category ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="font-semibold">Denuciador</TableHead>
                  <TableHead className="font-semibold">Denunciado</TableHead>
                  <TableHead className="font-semibold">Categoria</TableHead>
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} className="border-slate-200">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold">
                          {report.Denunciador_avatar}
                        </div>
                        {report.Nome_denuncia}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{report.Denunciado}</p>
                        <Badge variant="outline" className="text-xs">
                          {report.Tipo_denuncia}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{report.categoria}</TableCell>
                    <TableCell className="text-sm">{report.data}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(report.estado)}>
                        {report.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(report)}
                        className="text-blue-600 hover:text-blue-700 border-blue-200"
                      >
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modelo detalhado de Denúnica */}

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>

  <SheetContent className="w-full sm:w-[540px]">
    {selectedReport && (
      <>
        <SheetHeader>
          <SheetTitle>Detalhe das Denúncias</SheetTitle>
          <SheetDescription>Analise e gerencie as Denúncias</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6 overflow-y-auto h-[calc(100vh-80px)]">
          {/* Report Summary */}
          <div className="space-y-4 border-b border-slate-200 pb-6">
            <h3 className="font-semibold flex items-center gap-2 text-foreground">
              <AlertCircle className="h-4 w-4" />
              Informação da Denúncia
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium">{selectedReport.categoria}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Submitted</p>
                <p className="font-medium">{selectedReport.data}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm mt-1">{selectedReport.descricao}</p>
            </div>
          </div>

          {/* Reporter Info */}
          <div className="space-y-4 border-b border-slate-200 pb-6">
            <h3 className="font-semibold text-foreground">Reporter</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-semibold">
                {selectedReport.Denunciador_avatar}
              </div>
              <div>
                <p className="font-medium">{selectedReport.Nome_denuncia}</p>
                <p className="text-sm text-muted-foreground">Verified User</p>
              </div>
            </div>
          </div>

          {/* Reported Info */}
          <div className="space-y-4 border-b border-slate-200 pb-6">
            <h3 className="font-semibold text-foreground">Reported {selectedReport.Tipo_denuncia}</h3>
            <div>
              <p className="font-medium">{selectedReport.Denunciado}</p>
              <Badge variant="outline" className="mt-2">
                {selectedReport.Tipo_denuncia}
              </Badge>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Notas do administrador</h3>
            <Textarea
              placeholder="Add internal notes about this report..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>

          {/* Status Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            {selectedReport.estado !== "Aberto" && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleStatusChange("Aberto")}
              >
                Marcar como aberto
              </Button>
            )}
            {selectedReport.estado !== "Sob Revisão" && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleStatusChange("Sob Revisão")}
              >
               Em revisão
              </Button>
            )}
            {selectedReport.estado !== "Resolvido" && (
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusChange("Resolvido")}
              >
                Resolvido
              </Button>
            )}
          </div>
        </div>
      </>
    )}
  </SheetContent>
</Sheet>
    </div>
  )
}
