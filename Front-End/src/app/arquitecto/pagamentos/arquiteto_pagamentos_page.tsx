// src/app/arquiteto/pagamentos/page.tsx
// Dashboard do Arquiteto — ver as suas vendas e solicitar transferências

"use client";

import { useEffect, useState } from "react";
import { useArquitetoPayments, Compra } from "@/hooks/usePayments";
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
import {
  Banknote,
  Loader2,
  Send,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ArquitetoPagamentosPage() {
  const { compras, loading, error, carregar, solicitarTransferencia } =
    useArquitetoPayments();
  const [solicitando, setSolicitando] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    carregar();
  }, []);

  const handleSolicitar = async (compra_id: string) => {
    setSolicitando(compra_id);
    try {
      await solicitarTransferencia(compra_id);
      toast({
        title: "Solicitação enviada!",
        description: "O administrador irá processar o pagamento em breve.",
      });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setSolicitando(null);
    }
  };

  // ── Métricas ──
  const totalGanho = compras
    .filter((c) => ["pago", "solicitado", "transferido"].includes(c.status))
    .reduce((sum, c) => sum + c.valor, 0);

  const disponivelParaSolicitar = compras.filter((c) => c.status === "pago").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Os meus Pagamentos</h1>
        <p className="text-gray-500 mt-1">
          Acompanha as vendas das tuas plantas e solicita as tuas transferências.
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          label="Total Ganho"
          value={`$${totalGanho.toFixed(2)}`}
          bg="bg-emerald-50"
        />
        <MetricCard
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          label="Prontos para solicitar"
          value={disponivelParaSolicitar}
          bg="bg-blue-50"
        />
        <MetricCard
          icon={<Banknote className="h-5 w-5 text-purple-500" />}
          label="Transferências recebidas"
          value={compras.filter((c) => c.status === "transferido").length}
          bg="bg-purple-50"
        />
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>As minhas Vendas</CardTitle>
          <CardDescription>
            Plantas vendidas e estado das transferências
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <p className="text-center text-red-500 py-8">{error}</p>
          ) : compras.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Banknote className="mx-auto h-12 w-12 mb-3 opacity-30" />
              <p>Nenhuma venda ainda. As tuas plantas ainda não foram compradas.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Planta</TableHead>
                  <TableHead>Cliente</TableHead>
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
                      <div>{compra.cliente?.nome || "—"}</div>
                      <div className="text-xs text-gray-400">{compra.cliente?.email}</div>
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
                      {compra.status === "pago" && (
                        <Button
                          size="sm"
                          onClick={() => handleSolicitar(compra.id)}
                          disabled={solicitando === compra.id}
                          className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {solicitando === compra.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                          Solicitar
                        </Button>
                      )}
                      {compra.status === "solicitado" && (
                        <span className="text-xs text-blue-500 font-medium flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" />
                          Aguardando admin
                        </span>
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
    pendente:    "bg-yellow-100 text-yellow-800",
    pago:        "bg-emerald-100 text-emerald-800",
    solicitado:  "bg-blue-100 text-blue-800",
    transferido: "bg-purple-100 text-purple-800",
    cancelado:   "bg-red-100 text-red-800",
  };
  const labels: Record<string, string> = {
    pendente: "Pendente",
    pago: "Pago ✓",
    solicitado: "Solicitado",
    transferido: "Transferido ✓",
    cancelado: "Cancelado",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${map[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}
