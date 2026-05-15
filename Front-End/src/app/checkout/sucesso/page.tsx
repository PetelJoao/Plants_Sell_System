// src/app/checkout/sucesso/page.tsx
// Página de confirmação após pagamento bem sucedido no Stripe

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerificarSessao } from "@/hooks/usePayments";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SucessoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const { verificar, data, loading, error } = useVerificarSessao();

  useEffect(() => {
    if (sessionId) verificar(sessionId);
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle>Sessão inválida</CardTitle>
            <CardDescription>Nenhum ID de sessão encontrado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle>Erro ao verificar pagamento</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPago = data?.stripe_status === "paid";
  const planta = data?.compra?.planta;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          {isPago ? (
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500 mb-2" />
          ) : (
            <XCircle className="mx-auto h-16 w-16 text-yellow-500 mb-2" />
          )}
          <CardTitle className="text-2xl">
            {isPago ? "Pagamento confirmado!" : "Pagamento pendente"}
          </CardTitle>
          <CardDescription>
            {isPago
              ? "A sua planta foi adquirida com sucesso."
              : "O pagamento ainda não foi confirmado. Tente novamente mais tarde."}
          </CardDescription>
        </CardHeader>

        {data?.compra && (
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-100 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Planta</span>
                <span className="font-medium">{planta?.nome || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Valor</span>
                <span className="font-medium text-emerald-600">
                  ${data.compra.valor?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estado</span>
                <StatusBadge status={data.compra.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Referência</span>
                <span className="font-mono text-xs truncate max-w-[150px]">
                  {data.compra.stripe_session_id}
                </span>
              </div>
            </div>

            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Voltar às plantas
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pendente:    { label: "Pendente",    color: "bg-yellow-100 text-yellow-800" },
    pago:        { label: "Pago",        color: "bg-emerald-100 text-emerald-800" },
    solicitado:  { label: "Solicitado",  color: "bg-blue-100 text-blue-800" },
    transferido: { label: "Transferido", color: "bg-purple-100 text-purple-800" },
    cancelado:   { label: "Cancelado",   color: "bg-red-100 text-red-800" },
  };
  const s = map[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.color}`}>
      {s.label}
    </span>
  );
}
