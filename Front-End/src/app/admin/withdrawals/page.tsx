"use client"

import { useState, useEffect,useMemo } from "react"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ChevronDown, Upload, Download } from "lucide-react"
import { useAuth} from "@/Context/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Withdrawal {
  id: number
  Arquiteto_nome: string
  Arquiteto_avatar: string
  iban: string
  Quantidade: number
  requestDate: string
  estado: "Pendente" | "Pago"
  ComprovanteUrl?: string
}

const initialWithdrawals: Withdrawal[] = [
  {
    id: 1,
     Arquiteto_nome: "João Silva",
     Arquiteto_avatar: "JS",
    iban: "PT50 **** **** 1234",
    Quantidade: 5000,
    requestDate: "2024-03-10",
    estado: "Pendente",
  },
]

export default function WithdrawalsPage() {
  const { toast } = useToast()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals)
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Pendente" | "Pago">("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const { CarregarSaques , PagarSaque } = useAuth() as any 


  useEffect(() => {
    
    const loadWithdrawals = async () => {
      const data = await CarregarSaques()
      console.log("Saques carregados:", data)
      setWithdrawals(data)
    }
    loadWithdrawals()
  },[])

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      const matchesSearch = w.Arquiteto_nome?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "Todos" || w.estado === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [withdrawals, searchQuery, statusFilter])

  const handleManage = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setSheetOpen(true)
  }

  const handleMarkAsPaid = async () => {
  if (!selectedWithdrawal || !uploadedFile) {
    toast({ title: "Erro", description: "Por favor, envie um comprovante.", variant: "destructive" })
    return
  }

  const result = await PagarSaque(selectedWithdrawal.id, uploadedFile)

  if (result) {
    setWithdrawals(prev =>
      prev.map(w =>
        w.id === selectedWithdrawal.id
          ? { ...w, estado: "Pago", ComprovanteUrl: result.comprovativo_url }
          : w
      )
    )
    toast({ title: "Saque marcado como pago.", description: `Pedido de ${selectedWithdrawal.Arquiteto_nome} processado.` })
    setSheetOpen(false)
    setSelectedWithdrawal(null)
    setUploadedFile(null)
  } else {
    toast({ title: "Erro", description: "Falha ao processar pagamento.", variant: "destructive" })
  }
}


  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Saques</h1>
        <p className="text-muted-foreground">Gerenciar solicitações de saque e comprovantes de pagamento</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar por nome do arquiteto.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              {(["Todos", "Pendente", "Pago"] as const).map((filter) => (
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
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="font-semibold"></TableHead>
                  <TableHead className="font-semibold">Arquiteto</TableHead>
                  <TableHead className="font-semibold">IBAN</TableHead>
                  <TableHead className="font-semibold">Quantia</TableHead>
                  <TableHead className="font-semibold">Data da solicitação</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id} className="border-slate-200">
                    <TableCell>
                      <button 
                      aria-label="Toggle details"
                      onClick={() => setExpandedId(expandedId === withdrawal.id ? null : withdrawal.id)}>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedId === withdrawal.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold">
                          {withdrawal.Arquiteto_avatar}
                        </div>
                        {withdrawal.Arquiteto_nome}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono">{withdrawal.iban}</TableCell>
                    <TableCell className="font-semibold">${withdrawal.Quantidade.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{withdrawal.requestDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          withdrawal.estado === "Pago"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {withdrawal.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManage(withdrawal)}
                        className="text-blue-600 hover:text-blue-700 border-blue-200"
                      >
                        Gerenciar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:w-[540px]">
          {selectedWithdrawal && (
            <>
              <SheetHeader>
                <SheetTitle>Detalhes do saque</SheetTitle>
                <SheetDescription>
                  Gerenciar solicitação de saque para {selectedWithdrawal.Arquiteto_nome}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 py-6 overflow-y-auto h-[calc(100vh-80px)]">
                {/* Request Details */}
                <div className="space-y-4 border-b border-slate-200 pb-6">
                  <h3 className="font-semibold text-foreground">Solicitar informações</h3>
                  <div className="grid gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome do Arquiteto</p>
                      <p className="font-medium">{selectedWithdrawal.Arquiteto_nome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">IBAN (Completo)</p>
                      <p className="font-medium font-mono text-sm">AO.006.{selectedWithdrawal.iban}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Quantidade</p>
                        <p className="font-semibold text-lg">${selectedWithdrawal.Quantidade.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data da solicitação</p>
                        <p className="font-medium">{selectedWithdrawal.requestDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Proof Upload */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Comprovante de pagamento</h3>

                  {selectedWithdrawal.estado === "Pago" && selectedWithdrawal.ComprovanteUrl ? (
                    <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Documento comprovativo</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-blue-600 hover:text-blue-700 border-blue-200"
                      >
                        Baixar comprovante
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center space-y-3">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="proof-upload"
                      />
                      <label
                        htmlFor="proof-upload"
                        className="flex flex-col items-center gap-2 cursor-pointer"
                      >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <div className="text-sm">
                          <span className="font-medium text-blue-600 hover:text-blue-700">Carregar comprovante</span>
                          <span className="text-muted-foreground"> ou arraste e solte</span>
                        </div>
                        <p className="text-xs text-muted-foreground">PDF ou image (max 10MB)</p>
                      </label>
                      {uploadedFile && (
                        <div className="text-sm text-green-600 font-medium">
                          Ficheiro Selecionado: {uploadedFile.name}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedWithdrawal.estado === "Pendente" && (
                  <div className="flex gap-2 pt-6 border-t border-slate-200">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSheetOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                      onClick={handleMarkAsPaid}
                      disabled={!uploadedFile}
                    >
                      Marcar como Pago
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
