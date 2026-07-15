// src/app/admin/pagamentos/page.tsx
// Dashboard do Admin — gerir compras e aprovar transferências

"use client";

import { useEffect, useState } from "react";
import { useAdminPayments, StatusCompra, Compra } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  TrendingUp,
  Banknote,
  ShoppingCart,
  ArrowRightLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPagamentosPage() {
  const { compras, loading, error, carregar, aprovarTransferencia } = useAdminPayments();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [aprovando, setAprovando] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    carregar(filtroStatus === "todos" ? undefined : (filtroStatus as StatusCompra));
  }, [filtroStatus]);

  const handleAprovar = async (compra_id: string) => {
    setAprovando(compra_id);
    try {
      await aprovarTransferencia(compra_id);
      toast({
        title: "Transferência aprovada!",
        description: "O arquiteto será notificado.",
      });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setAprovando(null);
    }
  };

  // ── Métricas ──
  const totalArrecadado = compras
    .filter((c) => ["pago", "solicitado", "transferido"].includes(c.status))
    .reduce((sum, c) => sum + c.valor, 0);

  const pendentesTransferencia = compras.filter((c) => c.status === "solicitado").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Pagamentos</h1>
        <p className="text-gray-500 mt-1">
          Acompanha compras e aprova transferências para arquitetos.
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<ShoppingCart className="h-5 w-5 text-blue-500" />}
          label="Total de Compras"
          value={compras.length}
          bg="bg-blue-50"
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          label="Arrecadado"
          value={`$${totalArrecadado.toFixed(2)}`}
          bg="bg-emerald-50"
        />
        <MetricCard
          icon={<AlertCircle className="h-5 w-5 text-yellow-500" />}
          label="Transferências Pendentes"
          value={pendentesTransferencia}
          bg="bg-yellow-50"
        />
        <MetricCard
          icon={<Banknote className="h-5 w-5 text-purple-500" />}
          label="Transferidos"
          value={compras.filter((c) => c.status === "transferido").length}
          bg="bg-purple-50"
        />
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Compras</CardTitle>
            <CardDescription>Lista de todas as transações</CardDescription>
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="solicitado">Solicitado</SelectItem>
              <SelectItem value="transferido">Transferido</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <p className="text-center text-red-500 py-8">{error}</p>
          ) : compras.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nenhuma compra encontrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Planta</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Arquiteto</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compras.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell className="font-medium">
                      {compra.planta?.nome || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{compra.cliente?.nome || "—"}</div>
                      <div className="text-xs text-gray-400">{compra.cliente?.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{compra.arquiteto?.nome || "—"}</div>
                      <div className="text-xs text-gray-400">{compra.arquiteto?.email}</div>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-600">
                      ${compra.valor.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={compra.status} />
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(compra.created_at).toLocaleDateString("pt-AO")}
                    </TableCell>
                    <TableCell className="text-right">
                      {compra.status === "solicitado" && (
                        <Button
                          size="sm"
                          onClick={() => handleAprovar(compra.id)}
                          disabled={aprovando === compra.id}
                          className="gap-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {aprovando === compra.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <ArrowRightLeft className="h-3 w-3" />
                          )}
                          Transferir
                        </Button>
                      )}
                      {compra.status === "transferido" && (
                        <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sub-componentes ──

function MetricCard({
  icon, label, value, bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${bg}`}>{icon}</div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pendente:    "bg-yellow-100 text-yellow-800 border-yellow-200",
    pago:        "bg-emerald-100 text-emerald-800 border-emerald-200",
    solicitado:  "bg-blue-100 text-blue-800 border-blue-200",
    transferido: "bg-purple-100 text-purple-800 border-purple-200",
    cancelado:   "bg-red-100 text-red-800 border-red-200",
  };
  const labels: Record<string, string> = {
    pendente: "Pendente",
    pago: "Pago",
    solicitado: "Solicitado",
    transferido: "Transferido",
    cancelado: "Cancelado",
  };
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${map[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}
